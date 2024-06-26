import Store from "./store/Store.js";
import Router from "./view/Router.js";

class BrowserInfo {
  private store = new Store("__BROWSER_INFO_STORE");

  private normalizeLanguage(language: string): string {
    if (
      language.indexOf("-") !== -1 &&
      language !== "zh-TW" &&
      language !== "zh-HK"
    ) {
      language = language.substring(0, language.indexOf("-"));
    }
    return language;
  }

  public get language() {
    let language = this.store.get<string | undefined>("lang") ||
      navigator.language;
    return this.normalizeLanguage(language);
  }

  public set language(language: string) {
    this.store.set("lang", this.normalizeLanguage(language));
  }

  public changeLanguage(language: string) {
    if (!language) {
      throw new Error("Invalid language code.");
    }
    this.language = language;
    Router.refresh();
  }

  public get isPhoneSize() {
    return window.innerWidth <= 859;
  }

  public get installed() {
    return (navigator as any).standalone ||
      window.matchMedia("(display-mode: standalone)").matches;
  }

  public get isWindows() {
    return navigator.platform ? navigator.platform.indexOf("Win") > -1 : false;
  }

  public get isAndroid() {
    return /Android/i.test(navigator.userAgent);
  }

  public get isIOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  public get isMobileDevice() {
    return this.isAndroid || this.isIOS;
  }

  public get isDarkMode() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
}

export default new BrowserInfo();
