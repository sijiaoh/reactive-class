import type {ReactiveClass} from '@reactive-class/core';
import {createContext, PropsWithChildren, useContext} from 'react';
import type {Selector} from './useListen';
import {useListen} from '.';

export const ReactiveClassContext = createContext<{
  [key: string]: ReactiveClass;
}>({});

export function useFromContext<T extends typeof ReactiveClass>(
  klass: T
): InstanceType<T> {
  const context = useContext(ReactiveClassContext);
  const instance = context[klass.name];
  if (instance == null) throw new Error(klass.name + ' not found in context.');
  return instance as InstanceType<T>;
}

export function useListenFromContext<T extends typeof ReactiveClass>(
  klass: T
): InstanceType<T>;
export function useListenFromContext<T extends typeof ReactiveClass, U>(
  klass: T,
  selector: Selector<InstanceType<T>, U>
): U;
export function useListenFromContext<T extends typeof ReactiveClass, U>(
  klass: T,
  selector?: Selector<InstanceType<T>, U>
): InstanceType<T> | U {
  return useListen(useFromContext(klass), selector);
}

export function ReactiveClassProvider<T extends ReactiveClass>({
  instance,
  children,
}: PropsWithChildren<{
  instance: T;
}>) {
  const context = useContext(ReactiveClassContext);

  return (
    <ReactiveClassContext.Provider
      value={{...context, [instance.constructor.name]: instance}}
    >
      {children}
    </ReactiveClassContext.Provider>
  );
}
