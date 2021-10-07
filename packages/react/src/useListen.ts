import {ReactiveClass as Base} from '@reactive-class/core';
import {useEffect, useState} from 'react';
import {ReactiveClass} from '.';

Base.__onChange = instance => {
  if (!(instance instanceof ReactiveClass)) return;
  instance.__stateCount++;
  instance.__stateSetters.forEach(setter => {
    setter(instance.__stateCount);
  });
};

export const useListen = <T extends ReactiveClass>(instance: T) => {
  const [, setCount] = useState(instance.__stateCount);

  useEffect(() => {
    instance.__stateSetters.push(setCount);
    return () => {
      instance.__stateSetters = instance.__stateSetters.filter(
        setter => setter !== setCount
      );
    };
  }, [instance]);

  return instance;
};
