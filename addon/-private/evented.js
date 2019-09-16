import Notifier from './notifier';

// in lieue of a decorator, lets just use Mixin/composition pattern
export function addEvented(Base) {
  return class extends Base {
    on(eventName, listener) {
      return notifierForEvent(this, eventName).addListener(listener);
    }

    off(eventName, listener) {
      return notifierForEvent(this, eventName).removeListener(listener);
    }

    trigger(eventName, ...args) {
      const notifier = notifierForEvent(this, eventName);
      if (notifier) {
        notifier.trigger.apply(notifier, args);
      }
    }
  }
}

function notifierForEvent(
  object,
  eventName
) {
  if (object._eventedNotifiers === undefined) {
    object._eventedNotifiers = {};
  }

  let notifier = object._eventedNotifiers[eventName];

  if (!notifier) {
    notifier = object._eventedNotifiers[eventName] = new Notifier();
  }

  return notifier;
}
