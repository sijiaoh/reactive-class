import {useEffect, useState} from 'react';
import {ReactiveClass} from '.';

ReactiveClass.__onChange = instance => {
  if (!(instance instanceof ReactiveClass)) return;
  instance.__stateCount++;
  instance.__stateSetters.forEach(setter => {
    setter(instance.__stateCount);
  });
};

export const useListen = (instance: ReactiveClass) => {
  const [, setCount] = useState(instance.__stateCount);
  useEffect(() => {
    instance.__stateSetters.push(setCount);
    return () => {
      instance.__stateSetters = instance.__stateSetters.filter(
        setter => setter !== setCount
      );
    };
  }, [instance]);
};
