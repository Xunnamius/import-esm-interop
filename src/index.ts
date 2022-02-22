/* eslint-disable @typescript-eslint/no-explicit-any */
export async function importEsm<ImportType = any>(
  id: string,
  ...targets: string[]
): Promise<ImportType> {
  const namespace = await import(/* webpackIgnore: true */ id);

  // ? Return the default export by default
  if (targets.length == 0) {
    return namespace.default;
  } // ? Otherwise, if a single target is provided, return it
  else if (targets.length == 1) {
    return targets[0] == '*' ? namespace : namespace[targets[0]];
  } // ? Finally, if multiple targets are provided, return them all
  else {
    return targets.reduce(
      (retval, target) => ((retval[target] = namespace[target]), retval),
      {} as any
    );
  }
}
