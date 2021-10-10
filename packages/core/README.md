# Reactive Class Core

メンバー変数更新時に新旧の値を`===`で比較し、一致しなかった場合に変更イベントを発火するクラスを提供する。

## インストール

```bash
npm install @reactive-class/core
# or
yarn add @reactive-class/core
```

## 使い方

### 継承

ReactiveClass を継承してクラスを作る。

```ts
import {ReactiveClass} from '@reactive-class/core';

export class User extends ReactiveClass {
  name = '';
  email = '';
}
```

### サブスクライブ

subscribe 関数でコールバック関数を登録できる。

コールバック関数は変更イベント発火時に呼び出される。

```ts
import {User} from './User';

const user = new User();

const callback = (instance: User) => {
  console.log(instance.name);
};

const unsubscribe = user.subscribe(callback);
user.name = 'a'; // Console output: a
unsubscribe();
user.name = 'b'; // With no output.
```

### Destroy

destroy 関数を呼び出したインスタンスは reactive な挙動をしなくなる。

イベントの伝播もしない。

```ts
import {User} from './User';

const user = new User();

const callback = (instance: User) => {
  console.log(instance?.name);
};

const unsubscribe = user.subscribe(callback);
user.name = 'a'; // Console output: a
user.destroy(); // Console output: undefined
```

## 詳細

### 配列とオブジェクト

新旧の値を`===`で比較しているだけという仕様上、配列とオブジェクトの扱いには気をつける必要がある。

```ts
import {ReactiveClass} from '@reactive-class/react';

export class User extends ReactiveClass {
  arr: string[] = [];
  obj: {[key: string]: string} = {};
}

const user = new User();

// 全く新しい配列やオブジェクトを代入すると、変更イベントが発火する。
user.arr = ['a'];
user.obj = {a: 'a'};
user.arr = [...user.add, 'b'];
user.obj = {...user.obj, b: 'b'};

// 内部の値を変更するだけでは、変更イベントは発火しない。
user.arr.push('c');
user.obj['c'] = 'c';
```

複雑なオブジェクトには[Immer](https://github.com/immerjs/immer)を使用すると良いかもしれない。

ただし次項のイベント伝播で説明されている通り、ReactiveClass クラスインスタンスを直接所持している場合は別である。

### イベント伝播

変更イベントは伝播する。

直接所持している ReactiveClass インスタンスで変更イベントが発火した際には、自身でもイベントが発火する。

```ts
import {ReactiveClass} from '@reactive-class/react';

export class User extends ReactiveClass {
  name = '';
  // 直接所持。
  subUser?: User;
  // 直接所持ではない。
  // 配列を所持していると判断される。
  subUsers: User[] = [];
}

const user1 = new User();
const user2 = new User();
const user3 = new User();

// user1で変更イベント発火。
user1.subUser = user2;
// user2、user1双方で更新イベント発火。
user2.name = 'a';

// user1で変更イベント発火。
user1.subUsers = [user3];
// user3でのみ変更イベント発火。
user3.name = 'a';
```
