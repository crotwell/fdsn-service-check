
import { fdsnevent, fdsnstation, fdsndataselect, RSVP } from 'seisplotjs';
import { DS, EV, ST, createQuery, doesSupport, randomNetwork, randomStation } from './util';

export const testCommaStations = {
  testname: 'Comma Stations',
  testid: 'CommaStations',
  description: 'Queries for two station codes separated by comma from within a random unrestricted network returned from all networks, success as long as the query returns at least two stations.',
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
      return randomNetwork(dc);
    }).then(function (net) {
      const query = createQuery(dc, ST)
        .networkCode(net.networkCode);
      const url = query.formURL(fdsnstation.LEVEL_STATION);
      return query.queryStations().then(function (networks) {
        if (networks.length === 0) {
          const noNetErr = new Error('No networks returned');
          noNetErr.url = url;
          throw noNetErr;
        }
        if (networks[0].stations.length < 2) {
          const notTwoStaErr = new Error("can't test as not at least two stations returned: " + networks[0].stations.length);
          notTwoStaErr.url = url;
          throw notTwoStaErr;
        }
        // looks ok for starting testing
        return networks[0];
      });
    }).then(function (net) {
      const firstCode = net.stations[0].stationCode;
      let secondCode = firstCode;
      for (let i = 0; i < net.stations.length; i++) {
        if (net.stations[i].stationCode != firstCode) {
          secondCode = net.stations[i].stationCode;
          break;
        }
      }
      const query = createQuery(dc, ST)
        .networkCode(net.networkCode)
        .stationCode(firstCode + ',' + secondCode);
      const url = query.formURL(fdsnstation.LEVEL_STATION);
      return query.queryStations().then(function (networks) {
        if (networks.length === 0) {
          const noNetErr = new Error('No networks returned');
          noNetErr.url = url;
          throw noNetErr;
        }
        if (networks[0].stations.length < 2) {
          const notTwoStaErr = new Error('Not at least two stations returned for ' + net.networkCode + ': ' + networks[0].stations.length);
          notTwoStaErr.url = url;
          throw notTwoStaErr;
        }
        // looks ok
        return {
          text: 'Found ' + networks[0].stations.length,
          url: url,
          output: networks[0].stations
        };
      });
    });
  }
};
