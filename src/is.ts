import * as zod from "zod";

type Types = 'object' | 'boolean' | 'array' | 'string' | 'function';

type ExtractType<T extends Types> =
  T extends 'object' ? object :
  T extends 'boolean' ? boolean : // deno-lint-ignore no-explicit-any
  T extends 'array' ? any[] :
  T extends 'string' ? string :   // deno-lint-ignore no-explicit-any
  T extends 'function' ? (...args: any[]) => any :
  never;

export const is = <T extends Types>(type: T, value: unknown): value is ExtractType<T> =>
{
  const shapeMap: Record<Types, unknown> = {
    object: {},
    boolean: undefined,
    array: zod.any(), // usage: `its('array', value)`
    string: undefined,
    function: zod.function()
  };
  // deno-lint-ignore no-explicit-any
  const method = zod[type] as (...args: any[]) => any;
  return method(shapeMap[type]).safeParse(value).success;
}