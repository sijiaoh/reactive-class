import {act, create, ReactTestRenderer} from 'react-test-renderer';
import {ReactiveClass, ReactiveClassProvider, useListenFromContext} from '.';

class Example extends ReactiveClass {
  num = 0;
}

class Example2 extends ReactiveClass {
  num = 0;
}

describe(ReactiveClass.name, () => {
  describe(useListenFromContext.name, () => {
    describe('in provider', () => {
      describe('without selector', () => {
        it('should return instance', () => {
          function Component() {
            const e = useListenFromContext(Example);
            return <>{e.num}</>;
          }

          const e = new Example();

          let testRenderer!: ReactTestRenderer;
          void act(() => {
            testRenderer = create(
              <ReactiveClassProvider instance={e}>
                <Component />
              </ReactiveClassProvider>
            );
          });
          expect(testRenderer.toJSON()).toMatchInlineSnapshot('"0"');

          void act(() => {
            e.num++;
          });
          expect(testRenderer.toJSON()).toMatchInlineSnapshot('"1"');
        });
        describe('multiple class', () => {
          it('should work', () => {
            const example1 = new Example();
            const example2 = new Example2();

            function Component() {
              return (
                <ReactiveClassProvider instance={example2}>
                  <Child />
                </ReactiveClassProvider>
              );
            }

            function Child() {
              const e1 = useListenFromContext(Example);
              const e2 = useListenFromContext(Example2);
              return (
                <>
                  {e1.num}
                  {e2.num}
                </>
              );
            }

            let testRenderer!: ReactTestRenderer;
            void act(() => {
              testRenderer = create(
                <ReactiveClassProvider instance={example1}>
                  <Component />
                </ReactiveClassProvider>
              );
            });
            expect(testRenderer.toJSON()).toMatchInlineSnapshot(`
              Array [
                "0",
                "0",
              ]
            `);

            void act(() => {
              example1.num++;
              example2.num += 2;
            });
            expect(testRenderer.toJSON()).toMatchInlineSnapshot(`
              Array [
                "1",
                "2",
              ]
            `);
          });
        });
      });

      describe('with selector', () => {
        it('should return selector return value', () => {
          function Component() {
            const num = useListenFromContext(Example, e => e.num);
            return <>{num}</>;
          }

          const e = new Example();

          let testRenderer!: ReactTestRenderer;
          void act(() => {
            testRenderer = create(
              <ReactiveClassProvider instance={e}>
                <Component />
              </ReactiveClassProvider>
            );
          });
          expect(testRenderer.toJSON()).toMatchInlineSnapshot('"0"');

          void act(() => {
            e.num++;
          });
          expect(testRenderer.toJSON()).toMatchInlineSnapshot('"1"');
        });
      });
    });

    describe('out of provider', () => {
      it('should thro error', () => {
        function Component() {
          try {
            useListenFromContext(Example);
          } catch (e) {
            const err = e as Error;
            return <>{err.message}</>;
          }
          return <></>;
        }

        let testRenderer!: ReactTestRenderer;
        void act(() => {
          testRenderer = create(<Component />);
        });
        expect(testRenderer.toJSON()).toMatchInlineSnapshot(
          '"Example not found in context."'
        );
      });
    });
  });
});
