import {ReactiveClass} from '.';

class Example extends ReactiveClass {
  num = 0;
  arr: string[] = [];
  child?: Example;
  children: Example[] = [];
}

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

  describe('revision', () => {
    it('increment when instance changed', () => {
      const e = new Example();
      e.child = new Example();
      e.children = [new Example()];
      e.child.child = new Example();

      const initialRevision = e.revision;
      e.num++;
      e.arr = [];
      e.child.num++;
      e.children = [];
      e.child.child.num++;
      expect(e.revision).toBe(initialRevision + 5);
    });

    it('wrap around with ReactiveClass.revisionWrapAroundNumber', () => {
      const oldRevisionWrapAroundNumber =
        ReactiveClass.revisionWrapAroundNumber;
      ReactiveClass.revisionWrapAroundNumber = 3;

      const e = new Example();
      e.child = new Example();
      e.children = [new Example()];
      e.child.child = new Example();

      const initialRevision = e.revision;
      e.num++;
      e.arr = [];
      e.child.num++;
      e.children = [];
      e.child.child.num++;
      expect(e.revision).toBe((initialRevision + 5) % 3);

      ReactiveClass.revisionWrapAroundNumber = oldRevisionWrapAroundNumber;
    });
  });

  describe('subscribe', () => {
    it('return unsubscribe callback', () => {
      const e = new Example();
      expect(e['__callbacks'].length).toBe(0);
      const unsubscribe = e.subscribe(() => {});
      expect(e['__callbacks'].length).toBe(1);
      unsubscribe();
      expect(e['__callbacks'].length).toBe(0);
    });

    it('call callbacks when some value changed', () => {
      const e = new Example();
      e.child = new Example();
      e.children = [new Example()];
      e.child.child = new Example();

      let eCalledCount = 0;
      let childCalledCount = 0;
      let childrenCalledCount = 0;
      let grandChildCalledCount = 0;
      const subscribe = e.subscribe;
      subscribe(i => {
        expect(i.destroyed).toBeFalsy();
        eCalledCount++;
      });
      e.child.subscribe(() => {
        childCalledCount++;
      });
      e.children[0].subscribe(() => {
        childrenCalledCount++;
      });
      e.child.child.subscribe(() => {
        grandChildCalledCount++;
      });

      expect(eCalledCount).toBe(0);
      expect(childCalledCount).toBe(0);
      expect(childrenCalledCount).toBe(0);

      e.num++;
      expect(eCalledCount).toBe(1);

      e.arr = [];
      expect(eCalledCount).toBe(2);

      e.arr.push('');
      expect(eCalledCount).toBe(2);

      e.child.num++;
      expect(eCalledCount).toBe(3);
      expect(childCalledCount).toBe(1);

      e.children[0].num++;
      expect(eCalledCount).toBe(3);
      expect(childrenCalledCount).toBe(1);

      e.child.child.num++;
      expect(eCalledCount).toBe(4);
      expect(childCalledCount).toBe(2);
      expect(grandChildCalledCount).toBe(1);
    });
  });

  describe('destroy', () => {
    it('call callbacks with undefined', () => {
      const e = new Example();
      e.subscribe(i => expect(i.destroyed).toBeTruthy());
      e.destroy();
    });

    it('stop onChange propagation', () => {
      const e = new Example();
      e.child = new Example();
      e.child.child = new Example();

      let eChangeCount1 = 0;
      let eChangeCount2 = 0;
      let childChangeCount1 = 0;
      let childChangeCount2 = 0;
      let grandChildChangeCount1 = 0;
      let grandChildChangeCount2 = 0;

      e.subscribe(i => {
        if (!i.destroyed) eChangeCount1++;
        else eChangeCount2++;
      });
      e.child.subscribe(i => {
        if (!i.destroyed) childChangeCount1++;
        else childChangeCount2++;
      });
      e.child.child.subscribe(i => {
        if (!i.destroyed) grandChildChangeCount1++;
        else grandChildChangeCount2++;
      });

      expect(eChangeCount1).toBe(0);
      expect(eChangeCount2).toBe(0);
      expect(childChangeCount1).toBe(0);
      expect(childChangeCount2).toBe(0);
      expect(grandChildChangeCount1).toBe(0);
      expect(grandChildChangeCount2).toBe(0);

      e.child.destroy();

      expect(eChangeCount1).toBe(1);
      expect(eChangeCount2).toBe(0);
      expect(childChangeCount1).toBe(0);
      expect(childChangeCount2).toBe(1);
      expect(grandChildChangeCount1).toBe(0);
      expect(grandChildChangeCount2).toBe(0);

      e.child.num++;

      expect(eChangeCount1).toBe(1);
      expect(eChangeCount2).toBe(0);
      expect(childChangeCount1).toBe(0);
      expect(childChangeCount2).toBe(1);
      expect(grandChildChangeCount1).toBe(0);
      expect(grandChildChangeCount2).toBe(0);

      e.num++;

      expect(eChangeCount1).toBe(2);
      expect(eChangeCount2).toBe(0);
      expect(childChangeCount1).toBe(0);
      expect(childChangeCount2).toBe(1);
      expect(grandChildChangeCount1).toBe(0);
      expect(grandChildChangeCount2).toBe(0);

      e.child.child.num++;

      expect(eChangeCount1).toBe(2);
      expect(eChangeCount2).toBe(0);
      expect(childChangeCount1).toBe(0);
      expect(childChangeCount2).toBe(1);
      expect(grandChildChangeCount1).toBe(1);
      expect(grandChildChangeCount2).toBe(0);
    });
  });
});
