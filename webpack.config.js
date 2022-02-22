'use strict';

// This webpack config is used to transpile src to dist, compile externals,
// compile executables, etc

const { EnvironmentPlugin, DefinePlugin, BannerPlugin } = require('webpack');
const { verifyEnvironment } = require('./expect-env');
const nodeExternals = require('webpack-node-externals');
const pkgName = require('./package.json').name;
const debug = require('debug')(`${pkgName}:webpack-config`);

const IMPORT_ALIASES = {
  universe: `${__dirname}/src/`,
  multiverse: `${__dirname}/lib/`,
  testverse: `${__dirname}/test/`,
  externals: `${__dirname}/external-scripts/`,
  types: `${__dirname}/types/`,
  package: `${__dirname}/package.json`
};

let sanitizedEnv = {};
let { NODE_ENV: nodeEnv, ...sanitizedProcessEnv } = {
  ...process.env,
  NODE_ENV: 'production'
};

try {
  require('fs').accessSync('.env');
  const { NODE_ENV: forceEnv, ...parsedEnv } = require('dotenv').config().parsed;
  nodeEnv = forceEnv || nodeEnv;
  sanitizedEnv = parsedEnv;
  debug(`NODE_ENV: ${nodeEnv}`);
  debug('sanitized env: %O', sanitizedEnv);
} catch (e) {
  debug(`env support disabled; reason: ${e}`);
}

debug('sanitized process env: %O', sanitizedProcessEnv);
verifyEnvironment();

const envPlugins = () => [
  // ? NODE_ENV is not a "default" (unlike below) but an explicit overwrite
  new DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(nodeEnv)
  }),
  // ? Load our .env results as the defaults (overridden by process.env)
  new EnvironmentPlugin({ ...sanitizedEnv, ...sanitizedProcessEnv }),
  // ? Create shim process.env for undefined vars
  // ! The above already replaces all process.env.X occurrences in the code
  // ! first, so plugin order is important here
  new DefinePlugin({ 'process.env': '{}' })
];

const externals = () => [
  'next-server/dist/server/api-utils.js',
  nodeExternals({ importType: 'commonjs' }),
  ({ request }, cb) => {
    if (request == 'package') {
      // ? Externalize special "package" (alias of package.json) imports
      cb(null, `commonjs ${pkgName}/package.json`);
    } else if (/\.json$/.test(request)) {
      // ? Externalize all other .json imports
      cb(null, `commonjs ${request}`);
    } else cb();
  }
];

const libCjsConfig = {
  name: 'cjs',
  mode: 'production',
  target: 'node',
  node: false,

  entry: `${__dirname}/src/index.ts`,

  output: {
    filename: 'index.js',
    path: `${__dirname}/dist/cjs`,
    library: {
      type: 'commonjs2'
    }
  },

  externals: externals(),
  externalsPresets: { node: true },

  stats: {
    orphanModules: true,
    providedExports: true,
    usedExports: true,
    errorDetails: true
  },

  resolve: {
    extensions: ['.ts', '.wasm', '.mjs', '.cjs', '.js', '.json'],
    // ! If changed, also update these aliases in tsconfig.json,
    // ! jest.config.js, next.config.ts, and .eslintrc.js
    alias: IMPORT_ALIASES
  },
  module: {
    rules: [{ test: /\.(ts|js)x?$/, loader: 'babel-loader', exclude: /node_modules/ }]
  },
  optimization: { usedExports: true },
  plugins: [...envPlugins()]
};

module.exports = [libCjsConfig];
debug('exports: %O', module.exports);
