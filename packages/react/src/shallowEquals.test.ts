import {shallowEquals} from './shallowEquals';

class Example {
  a = 0;
  b = 1;
  c = () => {};
  d() {}
}

describe(shallowEquals.name, () => {
  it('return true', () => {
    expect(shallowEquals(0, 0)).toBeTruthy();
    expect(shallowEquals([], [])).toBeTruthy();
    expect(shallowEquals([0, 1], [0, 1])).toBeTruthy();
    expect(shallowEquals({}, {})).toBeTruthy();
    expect(shallowEquals({a: 0, b: 1}, {a: 0, b: 1})).toBeTruthy();
    const a = new Example();
    expect(shallowEquals(a, a)).toBeTruthy();
  });

  it('return true', () => {
    expect(shallowEquals(0, 1)).toBeFalsy();
    expect(shallowEquals([], [0])).toBeFalsy();
    expect(shallowEquals([0, 1], [0, 2])).toBeFalsy();
    expect(shallowEquals({}, {a: 0})).toBeFalsy();
    expect(shallowEquals({a: 0, b: 1}, {a: 0, b: 2})).toBeFalsy();
    const a = new Example();
    const b = new Example();
    expect(shallowEquals(a, b)).toBeFalsy();
  });
});
