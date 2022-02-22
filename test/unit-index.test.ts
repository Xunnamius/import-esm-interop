import { importEsm } from '../src/index';

jest.mock(
  'some-lib',
  () => ({
    default: () => 'default',
    aNamedExport: () => 'aNamedExport',
    bNamedExport: () => 'bNamedExport',
    cNamedExport: () => 'cNamedExport',
    __esModule: true
  }),
  { virtual: true }
);

describe('::importEsm', () => {
  it('imports the default export by default (without typings)', async () => {
    expect.hasAssertions();
    const someLib = await importEsm('some-lib');
    expect(someLib()).toBe('default');

    // someLib() is not a number, but it's has "any" type so should work anyway
    const someNum: number = someLib();
    void someNum;
  });

  it('imports the default export when provided explicitly', async () => {
    expect.hasAssertions();
    const someLib = await importEsm('some-lib', 'default');
    expect(someLib()).toBe('default');
  });

  it('imports an explicitly provided export (with provided typings)', async () => {
    expect.hasAssertions();

    const someLib = await importEsm<() => 'aNamedExport'>('some-lib', 'aNamedExport');
    expect(someLib()).toBe('aNamedExport');

    // @ts-expect-error: someLib() should not be a number
    const someNum: number = someLib();
    void someNum;
  });

  it('imports multiple explicitly provided exports', async () => {
    expect.hasAssertions();

    const { bNamedExport, cNamedExport } = await importEsm(
      'some-lib',
      'bNamedExport',
      'cNamedExport'
    );

    expect(bNamedExport()).toBe('bNamedExport');
    expect(cNamedExport()).toBe('cNamedExport');
  });

  it('imports special namespace export', async () => {
    expect.hasAssertions();

    const SomeLib = await importEsm('some-lib', '*');

    expect(SomeLib.default()).toBe('default');
    expect(SomeLib.aNamedExport()).toBe('aNamedExport');
    expect(SomeLib.bNamedExport()).toBe('bNamedExport');
    expect(SomeLib.cNamedExport()).toBe('cNamedExport');
  });
});
