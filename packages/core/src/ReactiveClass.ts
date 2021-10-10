export interface Callback<T extends ReactiveClass> {
  (instance: T | undefined): void;
}

export interface Unsubscribe {
  (): void;
}

export interface Subscribe<T extends ReactiveClass> {
  (callback: Callback<T>): Unsubscribe;
}

class Base {
  constructor(proxySet: ProxyHandler<Base>['set']) {
    return new Proxy(this, {set: proxySet});
  }
}

export class ReactiveClass extends Base {
  private static instances: ReactiveClass[] = [];

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super((target: any, p, value) => {
      const prop = target[p];
      if (prop === value) return true;

      target[p] = value;

      if (!p.toString().startsWith('__')) {
        if (prop instanceof ReactiveClass) {
          prop.__parents = prop.__parents.filter(parent => parent === this);
        }
        if (value instanceof ReactiveClass) {
          value.__parents.push(this);
        }

        if (!this.__destroyed) this.__onChange?.();
      }

      return true;
    });

    ReactiveClass.instances.push(this);
  }

  destroy = () => {
    ReactiveClass.instances = ReactiveClass.instances.filter(
      instance => instance !== this
    );
    ReactiveClass.instances.forEach(instance => {
      instance.__parents = instance.__parents.filter(parent => parent !== this);
    });
    this.__destroyed = true;
    this.__onChange();
  };

  subscribe: Subscribe<this> = callback => {
    this.__callbacks.push(callback);
    return () => {
      this.__callbacks = this.__callbacks.filter(c => c !== callback);
    };
  };

  protected __changeCount = 0;

  private __parents: ReactiveClass[] = [];
  private __callbacks: Callback<this>[] = [];
  private __destroyed = false;

  private __onChange = () => {
    this.__changeCount++;
    this.__callbacks.forEach(callback =>
      callback(this.__destroyed ? undefined : this)
    );
    this.__parents.forEach(parent => parent.__onChange());
  };
}
