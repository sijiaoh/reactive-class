import {useEffect, useState} from 'react';
import shallowequal from 'shallowequal';
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
  const [, setCount] = useState(instance.revision);
  const [ret, setRet] = useState(selector ? selector(instance) : instance);

  useEffect(() => {
    const callback = !selector
      ? (instance: T | undefined) => {
          if (!instance) return;
          setCount(instance.revision);
        }
      : () => {
          const newRet = selector ? selector(instance) : instance;
          if (shallowequal(ret, newRet)) return;
          setRet(newRet);
        };

    return instance.subscribe(callback);
  }, [instance, ret, selector]);

  return ret;
}
