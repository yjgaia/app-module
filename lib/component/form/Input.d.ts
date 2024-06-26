import Component from "../Component.js";
export default class Input extends Component {
    private input;
    private previousValue;
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
    });
    get value(): string;
    set value(value: string);
    select(): void;
}
//# sourceMappingURL=Input.d.ts.map