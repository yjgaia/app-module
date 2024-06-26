import { EventHandler } from "../event/EventContainer.js";
import EventTreeNode from "../tree/EventTreeNode.js";
import ArrayUtil from "../util/ArrayUtil.js";

export type Style = { [key: string]: string | number | undefined };

export type DomEventHandler<ET extends Event, DT extends DomNode> = (
  event: ET,
  domNode: DT,
) => any;

interface Attributes<DT extends DomNode> {
  [name: string]:
    | Style
    | string
    | number
    | boolean
    | undefined
    | DomEventHandler<any, DT>;
}

export type DomChild<DT extends DomNode = DomNode> =
  | Attributes<DT>
  | DT
  | string
  | undefined;

type Events = {
  [eventName: string]: {
    eventHandler: EventHandler;
    domEventHandler: EventHandler;
  }[];
};

export default class DomNode<
  EL extends HTMLElement = HTMLElement,
  CT extends DomNode = DomNode<HTMLElement, any>,
> extends EventTreeNode {
  private static readonly NUMBER_STYLE_KEY = [
    "zIndex",
    "opacity",
    "flexGrow",
    "flexShrink",
    "gridGap",
    "order",
    "zoom",
  ];

  private static keyframesCount = 0;

  public static createElement<EL extends HTMLElement>(tag: string): EL {
    let id: string | undefined;
    const idIndex = tag.indexOf("#");
    if (idIndex !== -1) {
      id = tag.substring(idIndex + 1);
      tag = tag.substring(0, idIndex);

      const cindex = id.indexOf(".");
      if (cindex !== -1) {
        tag += id.substring(cindex);
        id = id.substring(0, cindex);
      }
    }

    let className: string | undefined;
    const classNameIndex = tag.indexOf(".");
    if (classNameIndex !== -1) {
      className = tag.substring(classNameIndex + 1).replace(/\./g, " ");
      tag = tag.substring(0, classNameIndex);
    }

    if (tag === "") {
      tag = "div";
    }

    const element = document.createElement(tag) as EL;
    if (id !== undefined) {
      element.id = id;
    }
    if (className !== undefined) {
      element.className = className;
    }
    return element;
  }

  declare parent: DomNode | undefined;
  declare children: CT[];

  private domEventMap: Events = {};
  private windowEventMap: Events = {};

  public domElement: EL;

  constructor(domElement?: EL | string, ...children: DomChild[]) {
    super();
    this.addAllowedEvents("visible");
    if (domElement instanceof HTMLElement) {
      this.domElement = domElement;
    } else {
      this.domElement = DomNode.createElement<EL>(domElement ?? "");
    }
    this.append(...children);
  }

  public style(style: Style): this {
    for (const [key, value] of Object.entries(style)) {
      if (value === undefined) {
        (this.domElement.style as any)[key] = null;
      } else if (
        typeof value === "number" &&
        DomNode.NUMBER_STYLE_KEY.includes(key) !== true
      ) {
        (this.domElement.style as any)[key] = `${value}px`;
      } else {
        (this.domElement.style as any)[key] = value;
      }
    }
    return this;
  }

  public get rect(): DOMRect {
    return this.domElement.getBoundingClientRect();
  }

  public get innerScrollPosition(): { left: number; top: number } {
    let left = 0;
    let top = 0;

    if (this.domElement !== document.body) {
      let parent = this.domElement.parentNode;
      while (parent !== document.body && parent !== null) {
        if (parent instanceof HTMLElement) {
          left += parent.scrollLeft;
          top += parent.scrollTop;
        }
        parent = parent.parentNode;
      }
    }

    return { left, top };
  }

  public onDom<ET extends Event>(
    eventName: string,
    eventHandler: DomEventHandler<ET, this>,
  ): void {
    if (this.domEventMap[eventName] === undefined) {
      this.domEventMap[eventName] = [];
    }
    const domEventHandler = (event: ET) => eventHandler(event, this);
    this.domEventMap[eventName].push({ eventHandler, domEventHandler });
    this.domElement.addEventListener(eventName, domEventHandler as any);
  }

  public onWindow<ET extends Event>(
    eventName: string,
    eventHandler: DomEventHandler<ET, this>,
  ): void {
    if (this.windowEventMap[eventName] === undefined) {
      this.windowEventMap[eventName] = [];
    }
    const domEventHandler = (event: ET) => eventHandler(event, this);
    this.windowEventMap[eventName].push({ eventHandler, domEventHandler });
    window.addEventListener(eventName, domEventHandler as any);
  }

  public offWindow<ET extends Event>(
    eventName: string,
    eventHandler: DomEventHandler<ET, this>,
  ): void {
    const windowEvents = this.windowEventMap[eventName];
    if (windowEvents !== undefined) {
      const windowEvent = windowEvents.find((we) =>
        we.eventHandler === eventHandler
      );
      if (windowEvent !== undefined) {
        window.removeEventListener(eventName, windowEvent.domEventHandler);
        ArrayUtil.pull(windowEvents, windowEvent);
        if (windowEvents.length === 0) {
          delete this.windowEventMap[eventName];
        }
      }
    }
  }

  public offDom<ET extends Event>(
    eventName: string,
    eventHandler: DomEventHandler<ET, this>,
  ): void {
    const domEvents = this.domEventMap[eventName];
    if (domEvents !== undefined) {
      const domEvent = domEvents.find((de) => de.eventHandler === eventHandler);
      if (domEvent !== undefined) {
        this.domElement.removeEventListener(
          eventName,
          domEvent.domEventHandler,
        );
        ArrayUtil.pull(domEvents, domEvent);
        if (domEvents.length === 0) {
          delete this.domEventMap[eventName];
        }
      }
    }
  }

  public emitDomEvent(eventName: string): void {
    this.domElement.dispatchEvent(new Event(eventName));
  }

  public appendText(text: string): this {
    if (this.domElement.tagName === "TEXTAREA") {
      this.domElement.append(text);
    } else {
      const fragment = new DocumentFragment();
      const strs = text.split("\n");
      for (const [index, str] of strs.entries()) {
        if (index > 0) {
          fragment.append(document.createElement("br"));
        }
        fragment.append(str);
      }
      this.domElement.append(fragment);
    }
    return this;
  }

  public set text(text: string | undefined) {
    this.empty();
    if (text) this.appendText(text);
  }

  public get text(): string {
    return this.domElement.textContent || "";
  }

  public append(...children: any[]): this {
    for (const child of children) {
      if (child !== undefined) {
        if (typeof child === "string") {
          this.appendText(child);
        } else if (child instanceof DomNode) {
          child.appendTo(this);
        } else { // attributes
          for (const [name, value] of Object.entries<any>(child)) {
            if (typeof value === "function") {
              this.onDom(name, value);
            } else if (name === "style" && typeof value === "object") {
              this.style(value);
            } else if (value === undefined) {
              this.domElement.removeAttribute(name);
            } else {
              this.domElement.setAttribute(name, String(value));
            }
          }
        }
      }
    }
    return this;
  }

  public prepend(...children: any[]): this {
    for (const child of children) {
      if (child !== undefined) {
        if (typeof child === "string") {
          this.domElement.prepend(child);
        } else if (child instanceof DomNode) {
          child.appendTo(this, 0);
        } else {
          for (const [name, value] of Object.entries<any>(child)) {
            if (typeof value === "function") {
              this.onDom(name, value);
            } else if (name === "style" && typeof value === "object") {
              this.style(value);
            } else if (value === undefined) {
              this.domElement.removeAttribute(name);
            } else {
              this.domElement.setAttribute(name, String(value));
            }
          }
        }
      }
    }
    return this;
  }

  private checkVisible(): boolean {
    if (this.parent !== undefined) {
      if (this.parent.domElement === document.body) {
        return true;
      } else {
        return this.parent.checkVisible();
      }
    }
    return false;
  }

  private fireVisible() {
    this.emit("visible");
    for (const child of this.children) {
      child.fireVisible();
    }
  }

  public appendTo(node: DomNode, index?: number): this {
    if (index !== undefined && index < node.children.length) {
      node.domElement.insertBefore(
        this.domElement,
        node.children[index].domElement,
      );
    } else {
      node.domElement.append(this.domElement);
    }
    const that = super.appendTo(node, index);
    if (this.checkVisible() === true) {
      this.fireVisible();
    }
    return that;
  }

  public empty(): this {
    super.empty();
    while (this.domElement.firstChild) {
      this.domElement.removeChild(this.domElement.firstChild);
    }
    return this;
  }

  public addClass(className: string): this {
    this.domElement.classList.add(className);
    return this;
  }
  public deleteClass(...className: string[]): this {
    this.domElement.classList.remove(...className);
    return this;
  }
  public hasClass(className: string): boolean {
    return this.domElement.classList.contains(className);
  }
  public toggleClass(className: string): void {
    this.domElement.classList.toggle(className);
  }
  public clone() {
    return new DomNode(this.domElement.cloneNode(true) as EL);
  }

  public delete(): void {
    this.domElement.remove();
    (this.domEventMap as unknown) = undefined;

    for (const [eventName, domEvents] of Object.entries(this.windowEventMap)) {
      for (const domEvent of domEvents) {
        window.removeEventListener(eventName, domEvent.domEventHandler);
      }
    }
    (this.windowEventMap as unknown) = undefined;

    super.delete();
    (this.domElement as unknown) = undefined;
  }

  public animate({
    keyframes,
    duration = 0.5,
    timingFunction = "ease",
    delay = 0,
    iterationCount = 1,
    direction = "normal",
    onEnd = () => {},
  }: {
    keyframes: { [key: string]: Style };
    duration?: number;
    timingFunction?: "ease" | "linear" | "ease-in" | "ease-out";
    delay?: number;
    iterationCount?: 1 | "infinite";
    direction?: "normal" | "reverse" | "alternate" | "alternate-reverse";
    onEnd?: () => void;
  }) {
    const keyframesName = "__KEYFRAMES_" + DomNode.keyframesCount++;
    let keyframesStr = "";
    let newStyle: Style = {};

    for (const [key, style] of Object.entries(keyframes)) {
      keyframesStr += `${key}{`;
      for (let [name, value] of Object.entries(style)) {
        if (
          typeof value === "number" && !["zIndex", "opacity"].includes(name)
        ) {
          value = value + "px";
        }
        keyframesStr += `${
          name.replace(/([A-Z])/g, "-$1").toLowerCase()
        }:${value};`;
      }
      keyframesStr += "}";
      if (key === "from" || key === "0%") {
        newStyle = { ...newStyle, ...style };
      } else if (key === "to" || key === "100%") {
        newStyle = { ...newStyle, ...style };
      }
    }

    const keyframesStyleEl = document.createElement("style");
    keyframesStyleEl.setAttribute("type", "text/css");
    keyframesStyleEl.appendChild(
      document.createTextNode(`@keyframes ${keyframesName}{${keyframesStr}}`),
    );
    document.head.appendChild(keyframesStyleEl);

    newStyle = {
      ...newStyle,
      animation:
        `${keyframesName} ${duration}s ${timingFunction} ${delay}s ${iterationCount} ${direction}`,
    };
    this.style(newStyle);

    if (iterationCount === 1) {
      setTimeout(() => {
        if (!this.deleted) {
          onEnd();
        }
        keyframesStyleEl.remove();
      }, duration * 1000);
    }
  }
}
