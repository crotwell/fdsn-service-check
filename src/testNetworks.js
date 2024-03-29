
import { fdsnevent, fdsnstation, fdsndataselect, luxon } from 'seisplotjs';
import { DS, EV, ST, createQuery, doesSupport } from './util';

export const testNetworks = {
  testname: 'Networks',
  testid: 'Networks',
  description: 'Queries for all networks, success as long as the query returns something, even an empty result.',
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
