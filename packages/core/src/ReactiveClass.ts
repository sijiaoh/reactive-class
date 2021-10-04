export class ReactiveClass {
  constructor() {
    return new Proxy(this, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      set: (target: any, p, value) => {
        if (target[p] === value) return true;
        target[p] = value;
        this.onChange();
        return true;
      },
    });
  }

  private onChange = () => {};
}
