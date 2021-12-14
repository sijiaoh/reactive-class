import {useEffect, useState} from 'react';
import shallowequal from 'shallowequal';
import type {ReactiveClass} from './ReactiveClass';

export interface Selector<T, U> {
  (instance: T): U;
}

export interface UseListen {
  <T extends ReactiveClass>(instance: T): T;
  <T extends ReactiveClass>(instance: T | undefined): T | undefined;
  <T extends ReactiveClass, U>(instance: T, selector: Selector<T, U>): U;
  <T extends ReactiveClass, U>(
    instance: T | undefined,
    selector: Selector<T | undefined, U | undefined>
  ): U | undefined;
  <T extends ReactiveClass, U>(
    instance: T | undefined,
    selector: Selector<T | undefined, U | undefined> | undefined
  ): T | U | undefined;
}

export const useListen: UseListen = <T extends ReactiveClass, U>(
  instance: T | undefined,
  selector?: Selector<T | undefined, U | undefined>
): T | U | undefined => {
  const [, setCount] = useState(instance?.revision);
  const [ret, setRet] = useState<T | U | undefined>(
    selector ? selector(instance) : instance
  );

  useEffect(() => {
    if (instance == null) return;

    const callback = !selector
      ? (i: T) => {
          setCount(i.revision);
        }
      : (i: T) => {
          const newRet = selector ? selector(i) : i;
          if (shallowequal(ret, newRet)) return;
          setRet(newRet);
        };

    return instance.subscribe(callback);
  }, [instance, ret, selector]);

  return ret;
};
