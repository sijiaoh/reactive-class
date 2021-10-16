const path = require("path");
const fs = require("fs");
const { EOL } = require("os");
const { program } = require("commander");
const { spawnSync } = require("child_process");

const getPackagesData = () => {
  const { stdout } = spawnSync("yarn", ["workspaces", "list", "--json"]);
  const json = stdout.toString();
  return json
    .split(EOL)
    .filter((line) => !!line)
    .map((line) => JSON.parse(line));
};

const getPackageJsonPath = (location) => {
  return path.join(location, "package.json");
};

const getPackageJson = (location) => {
  const packageJsonPath = getPackageJsonPath(location);
  const packageJsonJson = fs.readFileSync(packageJsonPath).toString();
  return JSON.parse(packageJsonJson);
};

const getCurrentVersion = () => {
  const packagesData = getPackagesData();

  let versionStr;
  for (let i = 0; i < packagesData.length; i++) {
    const packageData = packagesData[i];
    const packageJson = getPackageJson(packageData.location);
    if (packageJson.version) {
      versionStr = packageJson.version;
      break;
    }
  }

  const [major, minor, patch] = versionStr.split(".").map((v) => Number(v));
  return { major, minor, patch };
};

const setAllPackagesVersion = (version) => {
  const packagesData = getPackagesData();
  packagesData.forEach(({ location }) => {
    const packageJson = getPackageJson(location);
    if (!packageJson.version) return;

    const newPackageJson = {
      ...packageJson,
      version: [version.major, version.minor, version.patch].join("."),
    };

    const packageJsonPath = getPackageJsonPath(location);
    fs.writeFileSync(packageJsonPath, JSON.stringify(newPackageJson));
  });
};

["major", "minor", "patch"].forEach((strategy) => {
  program.command(strategy).action(() => {
    const version = getCurrentVersion();
    version[strategy]++;
    setAllPackagesVersion(version);

    spawnSync("yarn", ["g:fix"]);
  });
});

program.parse(process.argv);
