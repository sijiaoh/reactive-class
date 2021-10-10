import {ReactiveClass as Base} from '@reactive-class/core';

export class ReactiveClass extends Base {
  __changeCount = 0;
  __changeCallbacks: ((changeCount: number) => void)[] = [];
}

Base.__onChange = instance => {
  if (!(instance instanceof ReactiveClass)) return;
  instance.__changeCount++;
  instance.__changeCallbacks.forEach(callback => {
    callback(instance.__changeCount);
  });
};
