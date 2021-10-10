import {useEffect, useState} from 'react';
import {shallowEquals} from './shallowEquals';
import {ReactiveClass} from '.';

interface Selector<T, U> {
  (instance: T): U;
}

export function useListen<T extends ReactiveClass>(instance: T): T;
export function useListen<T extends ReactiveClass, U>(
  instance: T,
  selector?: Selector<T, U>
): U;
export function useListen<T extends ReactiveClass, U>(
  instance: T,
  selector?: Selector<T, U>
): T | U {
  const [, setCount] = useState(instance.__changeCount);
  const [ret, setRet] = useState(selector ? selector(instance) : instance);

  useEffect(() => {
    const callback = !selector
      ? (changeCount: number) => {
          setCount(changeCount);
        }
      : () => {
          const newRet = selector ? selector(instance) : instance;
          if (shallowEquals(ret, newRet)) return;
          setRet(newRet);
        };

    instance.__changeCallbacks.push(callback);
    return () => {
      instance.__changeCallbacks = instance.__changeCallbacks.filter(
        c => c !== callback
      );
    };
  }, [instance, ret, selector]);

  return ret;
}
