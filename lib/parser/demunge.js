module.exports = demunge;

function demunge(policy, apiRoot) {
  if (!apiRoot) {
    apiRoot = '';
  }

  const res = ['ignore', 'patch', 'exclude'].reduce(function (acc, type) {
    acc[type] = policy[type]
      ? Object.keys(policy[type]).map(function (id) {
          const paths = policy[type][id].map(function (pathObj) {
            if (type === 'exclude' && typeof pathObj === 'string') {
              return {
                path: pathObj,
              };
            }

            const path = Object.keys(pathObj).pop();
            const res = {
              path: path,
            };
            if (type === 'ignore' || type === 'exclude') {
              res.reason = pathObj[path].reason;
              res.expires =
                pathObj[path].expires && new Date(pathObj[path].expires);
              res.disregardIfFixable = pathObj[path].disregardIfFixable;
            }

            return res;
          });
          return {
            id: id,
            url: apiRoot + '/vuln/' + id,
            paths: paths,
          };
        })
      : [];
    return acc;
  }, {});

  res.version = policy.version;

  return res;
}
