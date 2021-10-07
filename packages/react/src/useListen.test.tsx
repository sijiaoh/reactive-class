import {create, act, ReactTestRenderer} from 'react-test-renderer';
import {useListen, ReactiveClass} from '.';

class Example extends ReactiveClass {
  num = 0;
  arr: string[] = [];
  child?: Example;
  children: Example[] = [];
}

describe(useListen.name, () => {
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
          {e.child && (
            <Component
              e={e.child}
              name={name === 'e' ? 'child' : 'grandChild'}
            />
          )}
          {e.children.map((child, index) => (
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
    expect(testRenderer.toJSON()).toMatchSnapshot('5 children-0 num increment');
    expectRenderCount++;
    expect(renderCount).toBe(expectRenderCount);

    void act(() => {
      e.child!.child!.num++;
    });
    expect(testRenderer.toJSON()).toMatchSnapshot('6 grandChild num increment');
    expectRenderCount += instanceNum;
    expect(renderCount).toBe(expectRenderCount);
  });
});
