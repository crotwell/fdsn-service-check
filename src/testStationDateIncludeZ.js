
import { fdsnevent, fdsnstation, fdsndataselect, RSVP } from 'seisplotjs';
import { DS, EV, ST, createQuery, doesSupport, randomNetwork, randomStation, dateStrEndsZ } from './util';

export const testStationDateIncludeZ = {
  testname: 'Station Date Ends w/ Z',
  testid: 'StationDateIncludeZ',
  description: 'Queries for stations in random network and checks that the start and end time string ends with a Z for UTC timezone.',
  webservices: [ST],
  severity: 'opinion',
  test: function (dc) {
    return new RSVP.Promise(function (resolve, reject) {
      if (!doesSupport(dc, ST)) {
        reject(new Error('Unsupported'));
      } else {
        resolve(null);
      }
    }).then(function () {
      return randomNetwork(dc);
    }).then(function (net) {
      const query = createQuery(dc, ST)
        .networkCode(net.networkCode);
      return query.queryRawXml(fdsnstation.LEVEL_STATION);
    }).then(function (staml) {
      const top = staml.documentElement;
      const netArray = top.getElementsByTagNameNS(fdsnstation.STAML_NS, 'Network');
      netArray.url = top.url;
      for (let i = 0; i < netArray.length; i++) {
        const netStart = netArray.item(i).getAttribute('startDate');
        if (!dateStrEndsZ(netStart)) {
          const err = new Error('network ' + netArray.item(i).getAttribute('code') + ' start date does not end with Z: ' + netStart);
          err.url = staml.url;
          throw err;
        }
        const staArray = netArray.item(i).getElementsByTagNameNS(fdsnstation.STAML_NS, 'Station');
        for (let i = 0; i < staArray.length; i++) {
          const staStart = staArray.item(i).getAttribute('startDate');
          if (!dateStrEndsZ(staStart)) {
            const err = new Error('station ' + staArray.item(i).getAttribute('code') + ' start date does not end with Z: ' + staStart);
            err.url = staml.url;
            throw err;
          }
        }
      }
      return netArray;
    }).then(function (netArray) {
      return {
        text: 'Found ' + netArray.length,
        url: netArray.url,
        output: netArray
      };
    });
  }
};
