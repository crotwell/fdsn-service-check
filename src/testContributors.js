
import { fdsnevent, fdsnstation, fdsndataselect, RSVP } from 'seisplotjs';
import { DS, EV, ST, createQuery, doesSupport } from './util';

export const testContributors = {
  testname: 'Contributors',
  testid: 'Contributors',
  description: 'Queries the list of contributors of the event service, success as long as the query returns something',
  webservices: [EV],
  severity: 'severe',
  test: function (dc) {
    return new RSVP.Promise(function (resolve, reject) {
      if (!doesSupport(dc, EV)) {
        reject(new Error('Unsupported'));
      } else {
        resolve(null);
      }
    }).then(function () {
      const quakeQuery = createQuery(dc, EV);
      const url = quakeQuery.formContributorsURL();
      return quakeQuery.queryContributors().then(function (contributors) {
        return {
          text: 'Found ' + contributors.length,
          url: url,
          output: contributors
        };
      }).catch(function (err) {
        if (!err.url) { err.url = url; }
        throw err;
      });
    });
  }
};
