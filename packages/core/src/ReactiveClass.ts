export class ReactiveClass {
  public static __onChange?: (instance: ReactiveClass) => void;
  private static instances: ReactiveClass[] = [];

  private __self: ReactiveClass;
  private __parents: ReactiveClass[] = [];

  constructor() {
    const instance = new Proxy(this, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      set: (target: any, p, value) => {
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

          this.__onChange();
        }

        return true;
      },
    });

    this.__self = instance;
    ReactiveClass.instances.push(instance);

    return instance;
  }

  destroy = () => {
    ReactiveClass.instances = ReactiveClass.instances.filter(
      instance => instance !== this.__self
    );
    ReactiveClass.instances.forEach(instance => {
      instance.__parents = instance.__parents.filter(
        parent => parent !== this.__self
      );
    });
  };

  private __onChange = () => {
    ReactiveClass.__onChange?.(this.__self);
    this.__parents.forEach(parent => parent.__onChange());
  };
}
