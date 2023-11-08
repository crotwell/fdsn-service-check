
import { fdsnevent, fdsnstation, fdsndataselect } from 'seisplotjs';
import { DS, EV, ST, createQuery, doesSupport } from './util';

export const testNoDataEvent = {
  testname: 'NoData Event',
  testid: 'NoDataEvent',
  description: 'Queries for events that should be valid but return no data. Success if nothing is returned. This can also be a check on the CORS header.',
  webservices: [EV],
  severity: 'severe',
  test: function (dc) {
    return new Promise(function (resolve, reject) {
      if (!doesSupport(dc, EV)) {
        reject(new Error(EV + ' Unsupported by ' + dc.id));
      } else {
        resolve(null);
      }
    }).then(function () {
      const daysAgo = 1;
      const quakeQuery = createQuery(dc, EV)
        .startTime(new Date(new Date().getTime() - 86400 * daysAgo * 1000))
        .endTime(new Date())
        .minMag(99);
      const url = quakeQuery.formURL();
      return quakeQuery.query().then(function (quakes) {
        if (quakes.length > 0) {
          throw new Error('Should be no data, but ' + quakes.length + ' events.');
        } else {
          return {
            text: 'Found ' + quakes.length,
            url: url,
            output: quakes
          };
        }
      }).catch(function (err) {
        if (!err.url) { err.url = url; }
        throw err;
      });
    });
  }
};
