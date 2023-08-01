
import { fdsnevent, fdsnstation, fdsndataselect, util, RSVP } from 'seisplotjs';
import { DS, EV, ST, createQuery, doesSupport } from './util';

export const testDataSelectNoData = {
  testname: 'No Data',
  testid: 'DataSelectNoData',
  description: 'Attempts to make a dataselect query that should be correctly formed but should not return data. Success as long as the query returns, even with an empty result. This can also be a check on the CORS header.',
  webservices: [DS],
  severity: 'severe',
  test: function (dc) {
    return new RSVP.Promise(function (resolve, reject) {
      if (!doesSupport(dc, DS) || !doesSupport(dc, ST)) {
        reject(new Error('Unsupported'));
      } else {
        resolve(null);
      }
    }).then(function () {
      const query = createQuery(dc, DS);
      const url = query
        .networkCode('XX')
        .stationCode('ABC')
        .locationCode('99')
        .channelCode('XXX')
        .timeWindow(new util.StartEndDuration('1980-01-01T00:00:00', null, 300))
        .formURL();
      return query.queryDataRecords().then(function (miniseed) {
        if (miniseed.length > 0) {
          throw new Error('Should be no data, but ' + miniseed.length + ' miniseed records.');
        } else {
          return {
            text: 'Found ' + miniseed.length,
            url: url,
            output: miniseed
          };
        }
      }).catch(function (err) {
        if (!err.url) { err.url = url; }
        throw err;
      });
    });
  }
};
