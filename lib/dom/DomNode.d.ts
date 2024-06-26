import EventTreeNode from "../tree/EventTreeNode.js";
export type Style = {
    [key: string]: string | number | undefined;
};
export type DomEventHandler<ET extends Event, DT extends DomNode> = (event: ET, domNode: DT) => any;
interface Attributes<DT extends DomNode> {
    [name: string]: Style | string | number | boolean | undefined | DomEventHandler<any, DT>;
}
export type DomChild<DT extends DomNode = DomNode> = Attributes<DT> | DT | string | undefined;
export default class DomNode<EL extends HTMLElement = HTMLElement, CT extends DomNode = DomNode<HTMLElement, any>> extends EventTreeNode {
    private static readonly NUMBER_STYLE_KEY;
    private static keyframesCount;
    static createElement<EL extends HTMLElement>(tag: string): EL;
    parent: DomNode | undefined;
    children: CT[];
    private domEventMap;
    private windowEventMap;
    domElement: EL;
    constructor(domElement?: EL | string, ...children: DomChild[]);
    style(style: Style): this;
    get rect(): DOMRect;
    get innerScrollPosition(): {
        left: number;
        top: number;
    };
    onDom<ET extends Event>(eventName: string, eventHandler: DomEventHandler<ET, this>): void;
    onWindow<ET extends Event>(eventName: string, eventHandler: DomEventHandler<ET, this>): void;
    offWindow<ET extends Event>(eventName: string, eventHandler: DomEventHandler<ET, this>): void;
    offDom<ET extends Event>(eventName: string, eventHandler: DomEventHandler<ET, this>): void;
    emitDomEvent(eventName: string): void;
    appendText(text: string): this;
    set text(text: string | undefined);
    get text(): string;
    append(...children: any[]): this;
    prepend(...children: any[]): this;
    private checkVisible;
    private fireVisible;
    appendTo(node: DomNode, index?: number): this;
    empty(): this;
    addClass(className: string): this;
    deleteClass(...className: string[]): this;
    hasClass(className: string): boolean;
    toggleClass(className: string): void;
    clone(): DomNode<EL, DomNode<HTMLElement, any>>;
    delete(): void;
    animate({ keyframes, duration, timingFunction, delay, iterationCount, direction, onEnd, }: {
        keyframes: {
            [key: string]: Style;
        };
        duration?: number;
        timingFunction?: "ease" | "linear" | "ease-in" | "ease-out";
        delay?: number;
        iterationCount?: 1 | "infinite";
        direction?: "normal" | "reverse" | "alternate" | "alternate-reverse";
        onEnd?: () => void;
    }): void;
}
export {};
//# sourceMappingURL=DomNode.d.ts.map