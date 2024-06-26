import DomNode from "../../dom/DomNode.js";
import el from "../../dom/el.js";
import Component from "../Component.js";

export default class Input extends Component {
  private input: DomNode<HTMLInputElement> | DomNode<HTMLTextAreaElement>;
  private previousValue: string = "";

  constructor(options: {
    tag?: string;
    type?: string;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    multiline?: boolean;
    readonly?: boolean;
    value?: string;
  }) {
    super(
      "label.input" + (options.disabled === true ? ".disabled" : "") +
        (options.required === true ? ".required" : "") +
        (options.tag ?? ""),
    );
    this.addAllowedEvents("change", "enter");

    this.append(
      el("span.label", options.label),
      this.input = el(options.multiline === true ? "textarea" : "input", {
        type: options.type,
        placeholder: options.placeholder,
        disabled: options.disabled === true ? "disabled" : undefined,
        required: options.required === true ? "required" : undefined,
        readonly: options.readonly === true ? "readonly" : undefined,
        keydown: (event) => {
          if (event.key === "Enter") {
            this.emit("enter");
          }
        },
        keyup: () => {
          if (this.value !== this.previousValue) {
            this.emit("change");
            this.previousValue = this.value;
          }
        },
      }) as any,
    );

    if (options.value !== undefined) this.value = options.value;
  }

  public get value(): string {
    return this.input.domElement.value;
  }

  public set value(value: string) {
    if (this.input.domElement.value === value) return;
    this.input.domElement.value = value;
    this.emit("change");
  }

  public select() {
    this.input.domElement.select();
  }
}
