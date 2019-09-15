export default class Notifier {
  constructor() {
    this.listeners = [];
  }

  /**
   * Add a callback as a listener, which will be triggered when sending
   * notifications.
   */
  addListener(listener) {
    this.listeners.push(listener);

    return () => this.removeListener(listener);
  }

  /**
   * Remove a listener so that it will no longer receive notifications.
   */
  removeListener(listener) {
    const listeners = this.listeners;

    for (let i = 0, len = listeners.length; i < len; i++) {
      if (listeners[i] === listener) {
        listeners.splice(i, 1);
        return;
      }
    }
  }

  /**
   * Notify registered listeners.
   */
  trigger(...args) {
    this.listeners.slice(0).forEach(listener => listener(...args));
  }
}
