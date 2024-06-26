import DomNode from "../../dom/DomNode.js";
import Component from "../Component.js";
export interface ExitableOptions {
    barrierDismissible: boolean;
    ignoreExitableHash?: boolean;
}
export default abstract class Exitable extends DomNode {
    protected abstract container: Component;
    constructor(overlayTag: string, options: ExitableOptions);
    delete(): void;
    static deleteAll(): void;
}
//# sourceMappingURL=Exitable.d.ts.map