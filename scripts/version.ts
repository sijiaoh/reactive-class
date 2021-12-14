import {spawnSync} from 'child_process';
import fs from 'fs';
import {EOL} from 'os';
import path from 'path';
// eslint-disable-next-line node/no-unpublished-import
import {program} from 'commander';

const strategies = ['major', 'minor', 'patch'] as const;
type Version = {[key in typeof strategies[number]]: number};

const getPackagesData = () => {
  const {stdout} = spawnSync('yarn', ['workspaces', 'list', '--json']);
  const json = stdout.toString() as string;
  return json
    .split(EOL)
    .filter(line => !!line)
    .map(line => JSON.parse(line));
};

const getPackageJsonPath = (location: string) => {
  return path.join(location, 'package.json');
};

const getPackageJson = (location: string) => {
  const packageJsonPath = getPackageJsonPath(location);
  const packageJsonJson = fs.readFileSync(packageJsonPath).toString();
  return JSON.parse(packageJsonJson);
};

const getCurrentVersion: () => Version = () => {
  const packagesData = getPackagesData();

  let versionStr: string | undefined;
  for (let i = 0; i < packagesData.length; i++) {
    const packageData = packagesData[i];
    const packageJson = getPackageJson(packageData.location);
    if (packageJson.version) {
      versionStr = packageJson.version;
      break;
    }
  }

  if (!versionStr) throw new Error('Version not found.');

  const [major, minor, patch] = versionStr.split('.').map(v => Number(v));
  if (major == null || minor == null || patch == null)
    throw new Error('Failed to get current version.');
  return {major, minor, patch};
};

const setAllPackagesVersion = (version: Version) => {
  const packagesData = getPackagesData();
  packagesData.forEach(({location}) => {
    const packageJson = getPackageJson(location);
    if (!packageJson.version) return;

    const newPackageJson = {
      ...packageJson,
      version: [version.major, version.minor, version.patch].join('.'),
    };

    const packageJsonPath = getPackageJsonPath(location);
    fs.writeFileSync(packageJsonPath, JSON.stringify(newPackageJson));
  });
};

strategies.forEach(strategy => {
  program.command(strategy).action(() => {
    const version = getCurrentVersion();
    version[strategy]++;
    switch (strategy) {
      case 'major':
        version['minor'] = 0;
        version['patch'] = 0;
        break;
      case 'minor':
        version['patch'] = 0;
        break;
    }
    setAllPackagesVersion(version);

    spawnSync('yarn', ['g:fix']);
  });
});

program.parse(process.argv);
