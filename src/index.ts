/* eslint-disable @typescript-eslint/no-explicit-any */
export async function importEsm<ImportType = any>(id: string, ...targets: string[]) {
  const namespace = await import(/* webpack:ignore */ id);
  return (
    targets.length <= 1
      ? targets[0] == '*'
        ? namespace
        : namespace.default
      : targets.reduce(
          (retval, target) => (retval[target] = namespace[target]),
          {} as Record<string, unknown>
        )
  ) as ImportType;
}
