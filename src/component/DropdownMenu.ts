import BodyNode from "../dom/BodyNode.js";
import DomNode from "../dom/DomNode.js";
import el from "../dom/el.js";
import Component from "./Component.js";

export default class DropdownMenu extends Component {
  private ul: DomNode;

  constructor(options: {
    tag?: string;
    left: number;
    top: number;
    header?: DomNode;
    items: {
      icon?: DomNode;
      title: string;
      click: () => void;
    }[];
    footer?: DomNode;
  }) {
    super(".dropdown-menu" + (options.tag ?? ""));

    this.append(
      options.header,
      this.ul = el("ul"),
      options.footer,
    );

    for (const item of options.items) {
      this.ul.append(el(
        "li",
        el("button", item.icon, item.title, {
          click: (event) => {
            event.stopPropagation();
            item.click();
            this.delete();
          },
        }),
      ));
    }

    this.style({ left: options.left, top: options.top });
    this.on("visible", () => {
      const rect = this.rect;
      if (rect.left < 8) this.style({ left: 8 });
      else if (rect.left + rect.width > window.innerWidth - 8) {
        this.style({ left: window.innerWidth - rect.width - 8 });
      }
      if (rect.top < 8) this.style({ top: 8 });
      else if (rect.top + rect.height > window.innerHeight - 8) {
        this.style({ top: window.innerHeight - rect.height - 8 });
      }
    });

    window.getSelection()?.empty();
    for (const node of BodyNode.children) {
      if (node instanceof DropdownMenu) node.delete();
    }

    BodyNode.append(this);

    this.onWindow("click", (event: MouseEvent) => {
      if (!this.domElement.contains(event.target as Node)) {
        this.delete();
      }
    });

    this.onWindow("touchstart", (event: MouseEvent) => {
      if (!this.domElement.contains(event.target as Node)) {
        this.delete();
      }
    });

    this.onWindow("keydown", (event: KeyboardEvent) => {
      if (event.key === "Escape") this.delete();
    });
  }
}
