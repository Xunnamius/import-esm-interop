<!-- prettier-ignore-start -->

<!-- badges-start -->

[![Black Lives Matter!][badge-blm]][link-blm]
[![Maintenance status][badge-maintenance]][link-repo]
[![Last commit timestamp][badge-last-commit]][link-repo]
[![Open issues][badge-issues]][link-issues]
[![Pull requests][badge-pulls]][link-pulls]
[![Codecov][badge-codecov]][link-codecov]
[![Source license][badge-license]][link-license]
[![Tree shaking support][badge-tree-shaking]][link-bundlephobia]
[![Compressed package size][badge-size]][link-bundlephobia]
[![NPM version][badge-npm]][link-npm]
[![Uses Semantic Release!][badge-semantic-release]][link-semantic-release]

<!-- badges-end -->

<!-- prettier-ignore-end -->

# import-esm-interop

> [WTF is this?!][3] ... ... Well, this package is kinda useless until [said
> issue][3] is resolved.

This package exposes a tiny Node.js-only wrapper around the `import` function.
This purpose of this wrapper is as syntactic sugar for dynamic imports of
[**externalized ESM dependencies**][webpack-node-externals] in TypeScript/ESM
source destined to be bundled as CJS by Webpack. Since this package should
itself be an [externalized dependency][webpack-node-externals], using
`import-esm-interop` ensures:

- Webpack does not convert the dynamic import into a require statement
- Webpack does not [complain about "critical dependencies"][1] that have been
  properly externalized
- Webpack does not do something catastrophic like [blindly bundle _all your
  source files_ into one massive chunk][2]

Hence, this package has a very niche use case and **you probably don't need
it**. For most packages, it's easier to use their CJS entry point if available.
In a decade (🤞🏿) when CJS is dead and buried and ESM reigns supreme, this
package will be deprecated.

This package also passes through TypeScript typings if provided.

## Install

```Shell
npm install import-esm-interop
```

## Usage

> This interop function should only be used in CJS code or code that is compiled
> down to CJS (such as TypeScript)!

```TypeScript
const { importEsm } = require('import-esm-interop');

// Equivalent to (await import('some-lib')).default
const someLib = await importEsm('some-lib');

// Equivalent to the above
const someLib = await importEsm('some-lib', 'default');

// Equivalent to the above, but with TypeScript typings
const someLib = await importEsm<import('some-lib').default>('some-lib');

// Equivalent to (await import('some-lib')).aNamedExport
const aNamedExport = await importEsm('some-lib', 'aNamedExport');

// Equivalent to { bNamedExport: (...).bNamedExport, cNamedExport: ... }
const { bNamedExport, cNamedExport } = await importEsm(
  'some-lib',
  'bNamedExport',
  'cNamedExport'
);

// Equivalent to the above, but with TypeScript typings
const { bNamedExport, cNamedExport } = await importEsm<{
  bNamedExport: import('some-lib').bNamedExport,
  cNamedExport: import('some-lib').cNamedExport
}>('some-lib', 'bNamedExport', 'cNamedExport');

// Equivalent to await import('some-lib')
const SomeLib = await importEsm('some-lib', '*');

// Equivalent to the above, but with TypeScript typings
const SomeLib = await importEsm<import('some-lib')>('some-lib', '*');
```

If reusing the same typed import multiple times, you can make things less
painful by extracting away the dynamic import into a top-level function. Said
function could even be placed in a shared util file somewhere.

For example:

```TypeScript
// file: ./vendor-interop.ts

export const importSomeLib = async () => {
  return importEsm('some-lib', 'bNamedExport', 'cNamedExport') as {
    bNamedExport: import('some-lib').bNamedExport,
    cNamedExport: import('some-lib').cNamedExport
  };
}

// file: ./index.ts

import { importSomeLib } from './vendor-interop'

export async function doesSomething() {
  const { bNamedExport } = await importSomeLib();
  bNamedExport();
}
```

Again, we use `importEsm` instead of inlining the dynamic import to avoid
problems with Webpack. If you're not bundling your source, then there is **no
need** to use this sugar function!

## Documentation

> Further documentation can be found under [`docs/`][docs].

This is a [CJS2 package][cjs-rum-and-coke] built for Node14 and above. Due to it
being for CJS<->ESM interop, **this package is only available via `require(...)`
and cannot be imported by ESM code!** Further, this package is not meant to be
bundled (and will likely cause an error if it is attempted), and should instead
be [externalized][webpack-node-externals] along with every other module under
`node_modules/`.

For TypeScript and IDEs, each entry point (i.e. `ENTRY`) in [`package.json`'s
`exports[ENTRY]`][package-json] object includes an
[`exports[ENTRY].types`][exports-types-key] key pointing to its respective
TypeScript declarations file. There may be [other keys][package-json] for [other
runtimes][exports-conditions] as well, including `node` and `browser`. Finally,
[`package.json`][package-json] also includes the
[`sideEffects`][side-effects-key] key, which I set to `false` by default for
most of my libraries.

### License

[![FOSSA analysis][badge-fossa]][link-fossa]

## Contributing and Support

**[New issues][choose-new-issue] and [pull requests][pr-compare] are always
welcome and greatly appreciated! 🤩** Just as well, you can [star 🌟 this
project][link-repo] to let me know you found it useful! ✊🏿 Thank you!

See [CONTRIBUTING.md][contributing] and [SUPPORT.md][support] for more
information.

[badge-blm]: https://xunn.at/badge-blm 'Join the movement!'
[link-blm]: https://xunn.at/donate-blm
[badge-maintenance]:
  https://img.shields.io/maintenance/active/2022
  'Is this package maintained?'
[link-repo]: https://github.com/xunnamius/import-esm-interop
[badge-last-commit]:
  https://img.shields.io/github/last-commit/xunnamius/import-esm-interop
  'Latest commit timestamp'
[badge-issues]:
  https://img.shields.io/github/issues/Xunnamius/import-esm-interop
  'Open issues'
[link-issues]: https://github.com/Xunnamius/import-esm-interop/issues?q=
[badge-pulls]:
  https://img.shields.io/github/issues-pr/xunnamius/import-esm-interop
  'Open pull requests'
[link-pulls]: https://github.com/xunnamius/import-esm-interop/pulls
[badge-codecov]:
  https://codecov.io/gh/Xunnamius/import-esm-interop/branch/main/graph/badge.svg?token=HWRIOBAAPW
  'Is this package well-tested?'
[link-codecov]: https://codecov.io/gh/Xunnamius/import-esm-interop
[badge-license]:
  https://img.shields.io/npm/l/import-esm-interop
  "This package's source license"
[link-license]:
  https://github.com/Xunnamius/import-esm-interop/blob/main/LICENSE
[badge-fossa]:
  https://app.fossa.com/api/projects/git%2Bgithub.com%2FXunnamius%2Fimport-esm-interop.svg?type=large
  "Analysis of this package's license obligations"
[link-fossa]:
  https://app.fossa.com/projects/git%2Bgithub.com%2FXunnamius%2Fimport-esm-interop
[badge-npm]:
  https://api.ergodark.com/badges/npm-pkg-version/import-esm-interop
  'Install this package using npm or yarn!'
[link-npm]: https://www.npmjs.com/package/import-esm-interop
[badge-semantic-release]:
  https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
  'This repo practices continuous integration and deployment!'
[link-semantic-release]: https://github.com/semantic-release/semantic-release
[badge-size]: https://badgen.net/bundlephobia/minzip/import-esm-interop
[badge-tree-shaking]:
  https://badgen.net/bundlephobia/tree-shaking/import-esm-interop
  'Is this package optimized for Webpack?'
[link-bundlephobia]:
  https://bundlephobia.com/result?p=import-esm-interop
  'Package size (minified and gzipped)'
[package-json]: package.json
[docs]: docs
[choose-new-issue]:
  https://github.com/Xunnamius/import-esm-interop/issues/new/choose
[pr-compare]: https://github.com/Xunnamius/import-esm-interop/compare
[contributing]: CONTRIBUTING.md
[support]: .github/SUPPORT.md
[cjs-rum-and-coke]:
  https://dev.to/jakobjingleheimer/configuring-commonjs-es-modules-for-nodejs-12ed#cjs-source-and-distribution
[exports-types-key]:
  https://devblogs.microsoft.com/typescript/announcing-typescript-4-5-beta/#packagejson-exports-imports-and-self-referencing
[exports-conditions]:
  https://webpack.js.org/guides/package-exports/#reference-syntax
[side-effects-key]:
  https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free
[webpack-node-externals]: https://www.npmjs.com/package/webpack-node-externals
[1]: https://github.com/webpack/webpack/issues/196#issuecomment-232465701
[2]: https://github.com/webpack/webpack/issues/196#issuecomment-232355903
[3]: https://github.com/nodejs/node/issues/35889
