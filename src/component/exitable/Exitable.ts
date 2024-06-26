import BrowserInfo from "../../BrowserInfo.js";
import BodyNode from "../../dom/BodyNode.js";
import DomNode from "../../dom/DomNode.js";
import Component from "../Component.js";

export interface ExitableOptions {
  barrierDismissible: boolean;
  ignoreExitableHash?: boolean;
}

export default abstract class Exitable extends DomNode {
  protected abstract container: Component;

  constructor(overlayTag: string, options: ExitableOptions) {
    super(".exitable" + overlayTag);
    if (options.barrierDismissible === true) {
      this.onDom("click", (event: MouseEvent) => {
        if (event.target === this.domElement) {
          this.delete();
        }
      });
    }

    // for android back button
    if (
      options.ignoreExitableHash !== true &&
      BrowserInfo.isAndroid && BrowserInfo.installed &&
      window.location.pathname === "/" && !window.location.href.includes("#")
    ) {
      window.location.hash = "#exitable";
    }

    BodyNode.append(this);
  }

  public delete(): void {
    this.addClass("hide");
    this.container.addClass("hide");
    setTimeout(() => {
      if (!this.deleted) super.delete();
    }, 300);
  }

  public static deleteAll() {
    for (const child of BodyNode.children) {
      if (child instanceof Exitable) {
        child.delete();
      }
    }
  }
}
