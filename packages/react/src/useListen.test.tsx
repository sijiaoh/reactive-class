import {useEffect, useState} from 'react';
import {create, act, ReactTestRenderer} from 'react-test-renderer';
import {useListen, ReactiveClass} from '.';

class Example extends ReactiveClass {
  num = 0;
  arr: string[] = [];
  child?: Example;
  children: Example[] = [];
}

describe(useListen.name, () => {
  describe('without selector', () => {
    it('rerender component when instance value changed', () => {
      let renderCount = 0;
      let expectRenderCount = 0;
      const Component = ({e, name}: {e: Example; name: string}) => {
        const eData = useListen(e);
        renderCount++;
        return (
          <>
            {name}
            {eData.num}
            {JSON.stringify(eData.arr)}
            {eData.child?.child && `grandChild: ${eData.child.child.num}`}
            {eData.child && (
              <Component
                e={eData.child}
                name={name === 'e' ? 'child' : 'grandChild'}
              />
            )}
            {eData.children.map((child, index) => (
              <Component key={index} e={child} name={`children-${index}`} />
            ))}
          </>
        );
      };

      const e = new Example();
      e.child = new Example();
      e.children = [new Example(), new Example()];
      e.child.child = new Example();

      const instanceNum = 5;

      let testRenderer!: ReactTestRenderer;
      void act(() => {
        testRenderer = create(<Component e={e} name="e" />);
      });
      expect(testRenderer.toJSON()).toMatchSnapshot('0 default');
      expectRenderCount += instanceNum;
      expect(renderCount).toBe(expectRenderCount);

      void act(() => {
        e.num++;
      });
      expect(testRenderer.toJSON()).toMatchSnapshot('1 e num increment');
      expectRenderCount += instanceNum;
      expect(renderCount).toBe(expectRenderCount);

      void act(() => {
        e.arr.push('no');
      });
      expect(testRenderer.toJSON()).toMatchSnapshot('2 no changes');
      expect(renderCount).toBe(expectRenderCount);

      void act(() => {
        e.arr = ['yes'];
      });
      expect(testRenderer.toJSON()).toMatchSnapshot('3 e array changed');
      expectRenderCount += instanceNum;
      expect(renderCount).toBe(expectRenderCount);

      void act(() => {
        e.child!.num++;
      });
      expect(testRenderer.toJSON()).toMatchSnapshot('4 child num increment');
      expectRenderCount += instanceNum;
      expect(renderCount).toBe(expectRenderCount);

      void act(() => {
        e.children[0].num++;
      });
      expect(testRenderer.toJSON()).toMatchSnapshot(
        '5 children-0 num increment'
      );
      expectRenderCount++;
      expect(renderCount).toBe(expectRenderCount);

      void act(() => {
        e.child!.child!.num++;
      });
      expect(testRenderer.toJSON()).toMatchSnapshot(
        '6 grandChild num increment'
      );
      expectRenderCount += instanceNum;
      expect(renderCount).toBe(expectRenderCount);
    });
  });

  describe('with selector', () => {
    it('rerender component only selected value changed', () => {
      let renderCount = 0;
      const Component = ({e}: {e: Example}) => {
        const arr = useListen(e, ({arr}) => arr);
        renderCount++;
        return <>{JSON.stringify(arr)}</>;
      };

      const e = new Example();
      e.child = new Example();
      e.children = [new Example(), new Example()];
      e.child.child = new Example();

      let testRenderer!: ReactTestRenderer;
      void act(() => {
        testRenderer = create(<Component e={e} />);
      });
      expect(testRenderer.toJSON()).toMatchSnapshot('0 default');
      expect(renderCount).toBe(1);

      void act(() => {
        e.num++;
      });
      expect(renderCount).toBe(1);

      void act(() => {
        e.arr.push('no');
      });
      expect(renderCount).toBe(1);

      void act(() => {
        e.arr = ['yes'];
      });
      expect(testRenderer.toJSON()).toMatchSnapshot('1 arr changed');
      expect(renderCount).toBe(2);

      void act(() => {
        e.child!.num++;
      });
      expect(renderCount).toBe(2);

      void act(() => {
        e.children[0].num++;
      });
      expect(renderCount).toBe(2);

      void act(() => {
        e.child!.child!.num++;
      });
      expect(renderCount).toBe(2);
    });
  });

  describe('use revision with useEffect', () => {
    it('rerun useEffect only when user updated', () => {
      const user = new Example();
      let rerender!: () => void;
      let renderCount = 0;
      let updateCount = 0;

      const Component = () => {
        const {revision} = useListen(user, ({revision}) => ({revision}));
        const [count, setCount] = useState(0);

        useEffect(() => {
          rerender = () => {
            setCount(count + 1);
          };
        }, [count]);

        useEffect(() => {
          updateCount++;
        }, [revision]);

        renderCount++;

        return (
          <div>
            <div>{revision}</div>
          </div>
        );
      };

      let testRenderer!: ReactTestRenderer;
      void act(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        testRenderer = create(<Component />);
      });

      expect(renderCount).toBe(1);
      expect(updateCount).toBe(1);
      void act(() => {
        rerender();
      });
      expect(renderCount).toBe(2);
      expect(updateCount).toBe(1);
      void act(() => {
        user.num++;
      });
      expect(renderCount).toBe(3);
      expect(updateCount).toBe(2);
      void act(() => {
        rerender();
      });
      expect(renderCount).toBe(4);
      expect(updateCount).toBe(2);
    });
  });
});
