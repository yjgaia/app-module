import ErrorAlert from "../component/dialogue/ErrorAlert.js";
import XAccountEmailRequiredPopup from "../help/XAccountEmailRequiredPopup.js";
import msg from "../i18n/msg.js";
class AuthUtil {
    checkEmailAccess() {
        const params = new URLSearchParams(location.search);
        let message = params.get("error_description");
        if (message) {
            if (message === "Error getting user email from external provider") {
                new XAccountEmailRequiredPopup();
            }
            else {
                new ErrorAlert({
                    title: msg("error-alert-title"),
                    message,
                });
            }
        }
    }
}
export default new AuthUtil();
//# sourceMappingURL=AuthUtil.js.map