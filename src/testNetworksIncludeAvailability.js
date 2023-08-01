
import { fdsnevent, fdsnstation, fdsndataselect, RSVP } from 'seisplotjs';
import { DS, EV, ST, createQuery, doesSupport } from './util';

export const testNetworksIncludeAvailability = {
  testname: 'Networks IncludeAvailability',
  testid: 'NetworksIncludeAvailability',
  description: 'Queries for all networks, with includeavailability=false, success as long as the query returns something, even an empty result.',
  webservices: [ST],
  severity: 'severe',
  test: function (dc) {
    return new RSVP.Promise(function (resolve, reject) {
      if (!doesSupport(dc, ST)) {
        reject(new Error('Unsupported'));
      } else {
        resolve(null);
      }
    }).then(function () {
      const query = createQuery(dc, ST);
      query.includeAvailability(false);
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
