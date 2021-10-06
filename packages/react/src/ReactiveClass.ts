import {ReactiveClass as Base} from '@reactive-class/core';
import {Dispatch} from 'react';

export class ReactiveClass extends Base {
  __stateCount = 0;
  __stateSetters: Dispatch<number>[] = [];
}
