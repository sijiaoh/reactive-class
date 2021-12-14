import {
  Unsubscribe,
  Callback,
  ReactiveClass as CoreReactiveClass,
} from '@reactive-class/core';
import autoBind from 'auto-bind';
import {createContext, PropsWithChildren, useContext} from 'react';
import {Selector} from './useListen';
import {useListen} from '.';

export {Unsubscribe, Callback};

export class ReactiveClass extends CoreReactiveClass {
  static Context = createContext<{[key: string]: ReactiveClass}>({});

  static useFromContext<T extends ReactiveClass>(): T {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const context = useContext(ReactiveClass.Context);
    const instance = context[this.name];
    if (instance == null) throw new Error(this.name + ' not found in context.');
    return instance as T;
  }

  static useListenFromContext<T extends ReactiveClass>(): T;
  static useListenFromContext<T extends ReactiveClass, U>(
    selector: Selector<T, U>
  ): U;
  static useListenFromContext<T extends ReactiveClass, U>(
    selector?: Selector<T, U>
  ): T | U {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    if (selector == null) return useListen(this.useFromContext<T>());
    // eslint-disable-next-line react-hooks/rules-of-hooks
    else return useListen(this.useFromContext<T>(), selector);
  }

  constructor() {
    super();
    autoBind(this);
  }

  Provider({children}: PropsWithChildren<{}>) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const context = useContext(ReactiveClass.Context);

    return (
      <ReactiveClass.Context.Provider
        value={{...context, [this.constructor.name]: this}}
      >
        {children}
      </ReactiveClass.Context.Provider>
    );
  }
}
