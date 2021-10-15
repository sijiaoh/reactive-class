# Reactive Class React

変更イベント発火時にコンポーネントを再レンダリングする useListen フックを提供する。

変更イベントや注意、ReactiveClass に関しては [Core][rc-core-url] を参照すべし。

## インストール

```bash
npm install @reactive-class/react
# or
yarn add @reactive-class/react
```

## 使い方

### 継承

ReactiveClass を継承してクラスを作る。

```ts
import {ReactiveClass} from '@reactive-class/react';

export class User extends ReactiveClass {
  name = '';
  email = '';
}
```

### useListen

useListen に渡された ReactiveClass インスタンスで変更イベントが発火した場合、コンポーネントが再レンダリングされ、変更がビューに反映される。

```tsx
import {useListen} from '@reactive-class/react';
import {User} from './User';

const user = new User();

export const Component = () => {
  useListen(user);

  return (
    <div>
      <div>{user.name}</div>
      <div>{user.email}</div>
    </div>
  );
};
```

useListen はインスタンスをそのまま返すため、下記のように使用できる。

一度変数を経由させることで、変更により使われなくなった余分な useListen をエディターや eslint が警告してくれるので、特別な理由がない限りはこのやり方を推奨する。

```tsx
import {useListen} from '@reactive-class/react';
import {User} from './User';

const user = new User();

export const Component = () => {
  // userData === user
  const userData = useListen(user);

  return (
    <div>
      <div>{userData.name}</div>
      <div>{userData.email}</div>
    </div>
  );
};
```

### セレクタ

セレクタを使用することで、レンダリング回数を抑えることができる。

useListen はコールバック関数の戻り値を返し、user で変更イベントが発火する度に関数を再評価し、その戻り値が前回のものと異なっていた場合、コンポーネントを再レンダリングする。

```tsx
import {useListen} from '@reactive-class/react';
import {User} from './User';

const user = new User();

export const Component = () => {
  const name = useListen(user, instance => instance.name);

  return (
    <div>
      <div>{name}</div>
    </div>
  );
};
```

利便性のため、useListen はコールバック関数の戻り値が array や object だった場合は、単純に`===`で比較するのではなく、[shallowequal][shallowequal-url]で比較している。

よって、下のコードは上のコードと全く同じように振る舞う。

```tsx
import {useListen} from '@reactive-class/react';
import {User} from './User';

const user = new User();

export const Component = () => {
  const {name} = useListen(user, instance => ({name: instance.name}));

  return (
    <div>
      <div>{name}</div>
    </div>
  );
};
```

### Revision

ReactiveClass インスタンスは revision という整数値を持っており、これは変更イベントが発火するたびにインクリメントされていくため、useEffect などの更新判定配列に使用することができる。

**注意:** revision は一定値を超えると 0 に戻るため、大小の比較に使用することはできない。

```ts
import {useListen} from '@reactive-class/react';
import {User} from './User';

const user = new User();

export const Component = () => {
  const {revision, name} = useListen(user, ({revision, name}) => ({
    revision,
    name,
  }));

  useEffect(() => {
    console.log('user changed');
  }, [revision]);

  return (
    <div>
      <div>{name}</div>
    </div>
  );
};
```

[rc-core-url]: https://github.com/sijiaoh/reactive-class/tree/master/packages/core
[shallowequal-url]: https://github.com/dashed/shallowequal
