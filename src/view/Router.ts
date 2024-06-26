import BrowserInfo from "../BrowserInfo.js";
import Exitable from "../component/exitable/Exitable.js";
import BodyNode from "../dom/BodyNode.js";
import EventContainer from "../event/EventContainer.js";
import ArrayUtil from "../util/ArrayUtil.js";
import ExitAndroidAppPopup from "./ExitAndroidAppPopup.js";
import UriParser from "./UriParser.js";
import View, { ViewParams } from "./View.js";

export type ViewType = new (...args: any[]) => View;

const normalizePathname = (pathname: string) =>
  decodeURIComponent(
    pathname.endsWith("/")
      ? pathname.slice(0, -1).substring(1)
      : pathname.substring(1),
  );

const matchPattern = (
  uriParts: string[],
  pattern: string[],
  excludes: string[],
  params: ViewParams,
) =>
  pattern.some((pat) => UriParser.match(uriParts, pat.split("/"), params)) &&
  !excludes.some((exclude) => UriParser.match(uriParts, exclude.split("/")));

class Router extends EventContainer {
  private routes: {
    patterns: string[];
    excludes: string[];
    viewType: ViewType;
  }[] = [];
  private redirects: { patterns: string[]; excludes: string[]; to: string }[] =
    [];
  private openingViews: View[] = [];
  private forwarding = false;

  constructor() {
    super();
    this.addAllowedEvents("go");

    window.addEventListener("popstate", (event) => {
      if (this.forwarding === true) {
        this.forwarding = false;
      } else {
        const exitable = (BodyNode.children as any).findLast((child: any) =>
          child instanceof Exitable
        );
        if (exitable) {
          this.forwarding = true;
          window.history.forward();
          exitable.delete();
        } else {
          this.check(event.state ?? undefined);

          // for android back button
          if (
            BrowserInfo.isAndroid && BrowserInfo.installed &&
            window.location.pathname === "/" &&
            !window.location.href.includes("#")
          ) {
            new ExitAndroidAppPopup();
          }
        }
      }
      for (const child of BodyNode.children) {
        if (child.hasClass("dropdown-menu")) {
          child.delete();
        }
      }
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        const exitable = (BodyNode.children as any).findLast((child: any) =>
          child instanceof Exitable
        );
        exitable?.delete();
      }
    });
  }

  public check(preParams?: ViewParams, data?: any) {
    const uri = normalizePathname(location.pathname);
    const uriParts = uri.split("/");

    let viewCreated = false;
    const toCloseViews: View[] = [];

    for (const { patterns, excludes, to } of this.redirects) {
      const params: ViewParams = preParams ? { ...preParams } : {};
      if (matchPattern(uriParts, patterns, excludes, params)) {
        let uri = to;
        for (const [key, value] of Object.entries(params)) {
          uri = uri.replace(new RegExp(`\{${key}\}`, "g"), value ?? "");
        }
        this.goNoHistory(`/${uri}`, params, data);
        return;
      }
    }

    for (const { patterns, excludes, viewType } of this.routes) {
      const params: ViewParams = preParams ? { ...preParams } : {};
      const openingView = this.openingViews.find((ov) =>
        ov instanceof viewType
      );
      if (matchPattern(uriParts, patterns, excludes, params)) {
        if (openingView === undefined) {
          const view = new viewType();
          view.changeParams(params, uri, data);
          this.openingViews.push(view);
          viewCreated = true;
        } else {
          openingView.changeParams(params, uri, data);
        }
      } else if (openingView !== undefined) {
        toCloseViews.push(openingView);
        ArrayUtil.pull(this.openingViews, openingView);
      }
    }

    for (const toCloseView of toCloseViews.reverse()) {
      toCloseView.close();
    }

    if (viewCreated === true) {
      this.emit("go");
    }
  }

  public route(
    patterns: string | string[],
    viewType: ViewType,
    excludes: string[] = [],
  ) {
    if (typeof patterns === "string") {
      patterns = [patterns];
    }
    this.routes.push({ patterns, excludes, viewType });

    const uri = normalizePathname(location.pathname);
    const uriParts = uri.split("/");
    const params: ViewParams = {};
    if (matchPattern(uriParts, patterns, excludes, params)) {
      const view = new viewType();
      view.changeParams(params, uri);
      this.openingViews.push(view);
    }
  }

  public redirect(
    patterns: string | string[],
    to: string,
    excludes: string[] = [],
  ) {
    if (typeof patterns === "string") {
      patterns = [patterns];
    }
    this.redirects.push({ patterns, excludes, to });

    const uri = normalizePathname(location.pathname);
    const uriParts = uri.split("/");
    const params: ViewParams = {};
    if (matchPattern(uriParts, patterns, excludes, params)) {
      let uri = to;
      for (const [key, value] of Object.entries(params)) {
        uri = uri.replace(new RegExp(`\{${key}\}`, "g"), value ?? "");
      }
      this.goNoHistory(`/${uri}`);
    }
  }

  public go(uri: string, params?: ViewParams, data?: any) {
    if (location.pathname !== uri) {
      // for android back button
      if (
        BrowserInfo.isAndroid && BrowserInfo.installed &&
        window.location.pathname === "/" && !window.location.href.includes("#")
      ) {
        window.location.hash = "#exitable";
      }

      history.pushState(undefined, "", uri);
      this.check(params, data);
      window.scrollTo(0, 0);
    }
  }

  public changeUri(uri: string) {
    history.replaceState(undefined, "", uri);
  }

  public goNoHistory(uri: string, params?: ViewParams, data?: any) {
    if (location.pathname !== uri) {
      history.replaceState(undefined, "", uri);
      this.check(params, data);
      window.scrollTo(0, 0);
    }
  }

  public waitAndGo(uri: string, params?: ViewParams, data?: any) {
    setTimeout(() => this.go(uri, params, data));
  }

  public refresh() {
    for (const openingView of this.openingViews.reverse()) {
      openingView.close();
    }
    this.openingViews = [];

    const uri = normalizePathname(location.pathname);
    const uriParts = uri.split("/");
    for (const { patterns, excludes, viewType } of this.routes) {
      const params: ViewParams = {};
      if (matchPattern(uriParts, patterns, excludes, params)) {
        const view = new viewType();
        view.changeParams(params, uri);
        this.openingViews.push(view);
      }
    }
  }
}

export default new Router();
