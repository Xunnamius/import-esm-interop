'use strict';
// * Every now and then, we adopt best practices from CRA
// * https://tinyurl.com/yakv4ggx

// ? https://nodejs.org/en/about/releases
const NODE_LTS = 'maintained node versions';
const pkgName = require('./package.json').name;
const debug = require('debug')(`${pkgName}:babel-config`);

debug('NODE_ENV: %O', process.env.NODE_ENV);

module.exports = {
  parserOpts: { strictMode: true },
  plugins: [
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-function-bind',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-transform-typescript',
    // ? Interoperable named CJS imports for free
    [
      'transform-default-named-imports',
      {
        exclude: [/^next([/?#].+)?/, /^mongodb([/?#].+)?/]
      }
    ]
  ],
  // ? Sub-keys under the "env" config key will augment the above
  // ? configuration depending on the value of NODE_ENV and friends. Default
  // ? is: development
  env: {
    // * Used by Jest and `npm test`
    test: {
      sourceMaps: 'both',
      presets: [
        [
          '@babel/preset-env',
          // ! We exclude "proposal-dynamic-import" only for this package!
          // TODO: ... once V8 deep bug is fixed
          { targets: { node: true } /*, exclude: ['proposal-dynamic-import']*/ }
        ],
        ['@babel/preset-typescript', { allowDeclareFields: true }]
        // ? We don't care about minification
      ],
      plugins: [
        // ? Only active when testing, the plugin solves the following problem:
        // ? https://stackoverflow.com/q/40771520/1367414
        'explicit-exports-references'
      ]
    },
    // * Used by `npm run build`
    production: {
      presets: [
        [
          '@babel/preset-env',
          {
            // ? https://github.com/babel/babel-loader/issues/521#issuecomment-441466991
            //modules: false,
            targets: NODE_LTS
          }
        ],
        ['@babel/preset-typescript', { allowDeclareFields: true }]
        // ? Minification is handled by Webpack
      ]
    },
    // * Used by `npm run build-externals`
    external: {
      presets: [
        ['@babel/preset-env', { targets: { node: true } }],
        ['@babel/preset-typescript', { allowDeclareFields: true }]
        // ? Minification is handled by Webpack
      ]
    },
    // * Used for compiling tree shakable ESM code output in ./dist/esm-shakable
    'esm-shakable': {
      presets: [
        [
          '@babel/preset-env',
          {
            // ? https://babeljs.io/docs/en/babel-preset-env#modules
            modules: false,
            targets: NODE_LTS
          }
        ],
        ['@babel/preset-typescript', { allowDeclareFields: true }]
        // ? Minification is handled by Webpack
      ],
      plugins: [
        // ? Ensure all local imports without extensions now end in .mjs
        ['add-import-extension', { extension: 'mjs' }],
        // ? Fix ESM relative local imports referencing package.json
        [
          'transform-rename-import',
          {
            // ? See: https://bit.ly/38hFTa8
            replacements: [
              { original: 'package', replacement: `${pkgName}/package.json` }
            ]
          }
        ]
      ]
    }
  }
};

debug('exports: %O', module.exports);
