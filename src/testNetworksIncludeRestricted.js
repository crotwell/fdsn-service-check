
import { fdsnevent, fdsnstation, fdsndataselect, luxon } from 'seisplotjs';
import { DS, EV, ST, createQuery, doesSupport } from './util';

export const testNetworksIncludeRestricted = {
  testname: 'Networks IncludeRestricted',
  testid: 'NetworksIncludeRestricted',
  description: 'Queries for all networks, with includerestricted=false, success as long as the query returns something, even an empty result.',
  webservices: [ST],
  severity: 'severe',
  test: function (dc) {
    return new Promise(function (resolve, reject) {
      if (!doesSupport(dc, ST)) {
        reject(new Error('Unsupported'));
      } else {
        resolve(null);
      }
    }).then(function () {
      const query = createQuery(dc, ST);
      // set something
      query.startBefore(luxon.DateTime.utc());
      query.includeRestricted(false);
      const url = query.formURL(fdsnstation.LEVEL_NETWORK);
      return query.queryNetworks().then(function (networks) {
        return {
          text: 'Found ' + networks.length,
          url: url,
          output: networks
        };
      }).catch(function (err) {
        if (!err.url) { err.url = url; }
        throw err;
      });
    });
  }
};
