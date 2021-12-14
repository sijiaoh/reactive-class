import {act, create, ReactTestRenderer} from 'react-test-renderer';
import {ReactiveClass} from '.';

class Example extends ReactiveClass {
  num = 0;
}

class Example2 extends ReactiveClass {
  num = 0;
}

describe(ReactiveClass.name, () => {
  describe(ReactiveClass.useListenFromContext.name, () => {
    describe('in provider', () => {
      describe('without selector', () => {
        it('should return instance', () => {
          const Component = () => {
            const e = Example.useListenFromContext<Example>();
            return <>{e.num}</>;
          };

          const e = new Example();

          let testRenderer!: ReactTestRenderer;
          void act(() => {
            testRenderer = create(
              <e.Provider>
                <Component />
              </e.Provider>
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

            const Component = () => {
              return (
                <example2.Provider>
                  <Child />
                </example2.Provider>
              );
            };

            const Child = () => {
              const e1 = Example.useListenFromContext<Example>();
              const e2 = Example2.useListenFromContext<Example2>();
              return (
                <>
                  {e1.num}
                  {e2.num}
                </>
              );
            };

            let testRenderer!: ReactTestRenderer;
            void act(() => {
              testRenderer = create(
                <example1.Provider>
                  <Component />
                </example1.Provider>
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
          const Component = () => {
            const num = Example.useListenFromContext((e: Example) => e.num);
            return <>{num}</>;
          };

          const e = new Example();

          let testRenderer!: ReactTestRenderer;
          void act(() => {
            testRenderer = create(
              <e.Provider>
                <Component />
              </e.Provider>
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
        const Component = () => {
          try {
            Example.useListenFromContext<Example>();
          } catch (e) {
            const err = e as Error;
            return <>{err.message}</>;
          }
          return <></>;
        };

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
