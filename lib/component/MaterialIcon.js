import Component from "./Component.js";
export default class MaterialIcon extends Component {
    constructor(iconName) {
        super("span.icon.material-icon.material-symbols-outlined.notranslate." +
            iconName);
        this.text = iconName;
    }
}
//# sourceMappingURL=MaterialIcon.js.map