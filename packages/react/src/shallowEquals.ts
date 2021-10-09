// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const shallowEquals = (a: any, b: any) => {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof a !== typeof b) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    return (
      a.length === b.length && a.every((_, index) => a[index] === b[index])
    );
  }

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  return aKeys.length === bKeys.length && aKeys.every(key => a[key] === b[key]);
};
