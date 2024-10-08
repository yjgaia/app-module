import Router from "./route/Router.js";
class SPAInitializer {
    static INITIAL_PATH_KEY = "initialPath";
    init() {
        const initialPath = sessionStorage[SPAInitializer.INITIAL_PATH_KEY];
        if (initialPath) {
            Router.goWithoutHistory(initialPath);
            sessionStorage.removeItem(SPAInitializer.INITIAL_PATH_KEY);
        }
    }
}
export default new SPAInitializer();
//# sourceMappingURL=SPAInitializer.js.map