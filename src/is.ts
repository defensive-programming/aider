import * as zod from "zod";

type Types = 'object' | 'boolean' | 'array' | 'string' | 'function' | 'falsy';

// Note: This type includes `number` which covers `NaN`, but also includes all other numbers.
// The runtime check in isFalsy() handles NaN correctly.
// (ie., TS doesn't have a specific type for `NaN`)
type IsFalsyReturnType = null | undefined | '' | [] | {} | false | 0 | number;

type ExtractType<T extends Types> =
  T extends 'object' ? object :
  T extends 'boolean' ? boolean : // deno-lint-ignore no-explicit-any
  T extends 'array' ? any[] :
  T extends 'string' ? string :   // deno-lint-ignore no-explicit-any
  T extends 'function' ? (...args: any[]) => any :
  T extends 'falsy' ? IsFalsyReturnType :
  never;

export const is = <T extends Types>(type: T, value: unknown): value is ExtractType<T> =>
{
  if (type === 'falsy') return isFalsy(value)

  const shapeMap: Record<Exclude<Types, 'falsy'>, unknown> = {
    object: {},
    boolean: undefined,
    array: zod.any(), // usage: `its('array', value)`
    string: undefined,
    function: zod.function()
  };
  // deno-lint-ignore no-explicit-any
  const method = zod[type as Exclude<T, 'falsy'>] as (...args: any[]) => any;
  return method(shapeMap[type as Exclude<T, 'falsy'>]).safeParse(value).success;
}

const isFalsy = ($v: any): $v is IsFalsyReturnType =>
{
  if (typeof $v === 'number' && ($v <= 0 || Number.isNaN($v))) return true;
  const someFalsies = ['', false, null, undefined];
  return (
    someFalsies.includes($v as any) ||
    (Array.isArray($v) && $v.length === 0) ||
    (typeof $v === 'object' && $v !== null && Object.keys($v).length === 0)
  );
};
