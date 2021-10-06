import {ReactiveClass} from '.';

class Example extends ReactiveClass {
  num = 0;
  arr: string[] = [];
  child?: Example;
  children: Example[] = [];
}

afterEach(() => {
  ReactiveClass.__onChange = undefined;
});

describe(ReactiveClass.name, () => {
  it('all reactive class instance in ReactiveClass.instances', () => {
    expect(ReactiveClass['instances'].length).toBe(0);
    const e = new Example();
    expect(ReactiveClass['instances'].length).toBe(1);
    new Example();
    expect(ReactiveClass['instances'].length).toBe(2);
    e.destroy();
    expect(ReactiveClass['instances'].length).toBe(1);
  });

  describe('ReactiveClass.__onChange', () => {
    it('call when some value changed', () => {
      const e = new Example();
      const child = new Example();
      e.children = [new Example()];
      e.child = child;

      let calledCount = 0;
      let eCalledCount = 0;
      let childCalledCount = 0;
      let childrenCalledCount = 0;
      ReactiveClass.__onChange = instance => {
        calledCount++;
        switch (instance) {
          case e:
            eCalledCount++;
            break;
          case child:
            childCalledCount++;
            break;
          case e.children[0]:
            childrenCalledCount++;
            break;
        }
      };

      expect(calledCount).toBe(0);
      expect(eCalledCount).toBe(0);
      expect(childCalledCount).toBe(0);
      expect(childrenCalledCount).toBe(0);

      e.num++;
      expect(eCalledCount).toBe(1);

      e.arr = [];
      expect(eCalledCount).toBe(2);

      e.arr.push('');
      expect(eCalledCount).toBe(2);

      child.num++;
      expect(eCalledCount).toBe(3);
      expect(childCalledCount).toBe(1);

      e.children[0].num++;
      expect(eCalledCount).toBe(3);
      expect(childrenCalledCount).toBe(1);

      expect(calledCount).toBe(5);
    });
  });
});