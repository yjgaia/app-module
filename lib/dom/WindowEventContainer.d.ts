export default class WindowEventContainer {
    private listeners;
    onWindow<K extends keyof WindowEventMap>(type: K, listener: (ev: WindowEventMap[K]) => any, options?: boolean | AddEventListenerOptions): this;
    offWindow<K extends keyof WindowEventMap>(type: K, listener: (ev: WindowEventMap[K]) => any, options?: boolean | EventListenerOptions): this;
    remove(): void;
}
//# sourceMappingURL=WindowEventContainer.d.ts.map