/* eslint-disable jest/no-conditional-in-test */
import debugFactory from 'debug';
import { name as pkgName, version as pkgVersion, exports as pkgExports } from 'package';
import {
  run,
  mockFixtureFactory,
  dummyNpmPackageFixture,
  npmLinkSelfFixture,
  nodeImportTestFixture
} from './setup';

import type { FixtureOptions } from './setup';

const TEST_IDENTIFIER = 'integration-node';

const pkgMainPath = `${__dirname}/../${pkgExports['.'].node}`;
const debug = debugFactory(`${pkgName}:${TEST_IDENTIFIER}`);
const nodeVersion = process.env.MATRIX_NODE_VERSION || process.version;

// eslint-disable-next-line jest/require-hook
debug(`nodeVersion: "${nodeVersion}"`);

const fixtureOptions = {
  performCleanup: true,
  initialFileContents: {
    'package.json': `{"name":"dummy-pkg","dependencies":{"${pkgName}":"${pkgVersion}"}}`
  } as FixtureOptions['initialFileContents'],
  use: [dummyNpmPackageFixture(), npmLinkSelfFixture(), nodeImportTestFixture()]
} as Partial<FixtureOptions> & {
  initialFileContents: FixtureOptions['initialFileContents'];
};

const withMockedFixture = mockFixtureFactory(TEST_IDENTIFIER, fixtureOptions);

beforeAll(async () => {
  if ((await run('test', ['-e', pkgMainPath])).code != 0) {
    debug(`unable to find main distributable: ${pkgMainPath}`);
    throw new Error('must build distributables first (try `npm run build-dist`)');
  }
});

it('works as a CJS require(...)', async () => {
  expect.hasAssertions();

  const indexPath = `src/index.js`;

  // ? Install a package we know is ESM for sure
  fixtureOptions.npmInstall = ['chalk'];

  fixtureOptions.initialFileContents[indexPath] = `
    const { importEsm } = require('${pkgName}');

    (async () => {
      console.log((await importEsm('chalk')).name);
      console.log((await importEsm('chalk', 'Chalk')).name);
      console.log(Object.keys(await importEsm('chalk', '*')).toString());

      const { Chalk, chalkStderr } = await importEsm('chalk', 'Chalk', 'chalkStderr');
      console.log(Chalk.name);
      console.log(chalkStderr.name);
    })();`;

  await withMockedFixture(async (ctx) => {
    if (!ctx.testResult) throw new Error('must use node-import-test fixture');

    // ! DEEPLY BROKEN
    // TODO: fix this and publish package after V8 team fixes deep bug
    // * See: https://github.com/nodejs/node/issues/35889
    // const chalk = await import('chalk');

    // expect(ctx.testResult.stdout).toBe(
    //   [
    //     chalk.default.name,
    //     chalk.Chalk.name,
    //     Object.keys(chalk).toString(),
    //     chalk.Chalk.name,
    //     chalk.chalkStderr.name
    //   ].join('\n')
    // );

    expect(ctx.testResult?.code).toBe(0);
  });

  delete fixtureOptions.initialFileContents[indexPath];
});
