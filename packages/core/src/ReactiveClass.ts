export class ReactiveClass {
  constructor() {
    return new Proxy(this, {
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
