const cloneDeep = require('lodash.clonedeep');
const semver = require('semver');
const yaml = require('js-yaml');
const addComments = require('./add-comments');
const { version: versionFromPackageJson } = require('../../package.json');

module.exports = {
  import: imports,
  export: exports,
  demunge: require('./demunge'),
  version: version(),
};

const parsers = {
  v1: require('./v1'),
};

function imports(rawYaml) {
  let data = yaml.safeLoad(rawYaml || '');

  if (!data || typeof data !== 'object') {
    data = {};
  }

  if (!data.version) {
    data.version = version();
  }

  if (data.version === 'v1') {
    data.version = 'v1.0.0';
  }

  const parser = parsers['v' + semver.major(data.version.substr(1))];

  if (!parser) {
    throw new Error('unsupported version: ' + data.version);
  }

  return parser(data);
}

function exports(policy) {
  const data = cloneDeep(policy);

  // remove any private information on the policy
  Object.keys(data).map(function (key) {
    if (key.indexOf('__') === 0) {
      delete data[key];
    }

    if (data[key] == null) {
      // jshint ignore:line
      delete data[key];
    }

    // strip helper functions
    if (typeof data[key] === 'function') {
      delete data[key];
    }
  });

  // ensure we always update the version of the policy format
  data.version = version();
  // put inline comments into the exported yaml file
  return addComments(yaml.safeDump(data));
}

function version() {
  if (versionFromPackageJson && versionFromPackageJson !== '0.0.0') {
    return 'v' + versionFromPackageJson;
  }

  return 'v1.0.0';
}
