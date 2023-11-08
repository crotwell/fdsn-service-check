
import { fdsnevent, fdsnstation, fdsndataselect } from 'seisplotjs';
import { DS, EV, ST, createQuery, doesSupport, randomNetwork, randomStation } from './util';

export const testSensitivityUnit = {
  testname: 'Sensitvity units valid SI',
  testid: 'SensitivityUnit',
  description: 'Checks the units in the instrumentSensitivity against the validation list at https://github.com/iris-edu/StationXML-Validator/wiki/Unit-name-overview-for-IRIS-StationXML-validator',
  webservices: [ST],
  severity: 'opinion',
  test: function (dc) {
    return new Promise(function (resolve, reject) {
      if (!doesSupport(dc, ST)) {
        reject(new Error('Unsupported'));
      } else {
        resolve(null);
      }
    }).then(function () {
      return randomNetwork(dc, new Date());
    }).then(function (net) {
      return randomStation(dc, net.networkCode, new Date());
    }).then(function (station) {
      const query = createQuery(dc, ST)
        .networkCode(station.network.networkCode)
        .stationCode(station.stationCode);
      const nets = query.queryChannels();
      return Promise.all([ query, nets]);
    }).then(([ query, nets]) => {
      let knownUnits = fetch('knownUnits.json').then(function (response) {
        return response.json();
      });
      let url = query.formURL(fdsnstation.LEVEL_CHANNEL);
      return Promise.all([query, nets, knownUnits, url]);
    }).then( ([query, nets, knownUnitsJson, url]) => {
      console.log('knownUnits: ' + knownUnitsJson);
      const knownUnits = knownUnitsJson.units;
      console.log('Units: ' + knownUnits);
      for (const n of nets) {
        for (const s of n.stations) {
          console.log('Station: ' + s.codes());
          for (const c of s.channels) {
            let cu = c.instrumentSensitivity.inputUnits;
            let found = false;
            for (const u of knownUnits) {
              if (cu === u) {
                found = true;
                break;
              }
            }
            if (!found) {
              let foundLower = false;
              const cuLower = cu.toLowerCase();
              for (const u of knownUnits) {
                if (cuLower === u.toLowerCase()) {
                  foundLower = true;
                  break;
                }
              }
              let err = new Error('Unit ' + cu + ' not SI for ' + c.codes());
              if (foundLower) {
                err = new Error('Unit ' + cu + ' wrong case for SI in ' + c.codes());
              }
              err.url = nets.url;
              throw err;
            }

            cu = c.instrumentSensitivity.outputUnits;
            found = false;
            for (const u of knownUnits) {
              if (cu === u) {
                found = true;
                break;
              }
            }
            if (!found) {
              throw new Error('Unit ' + cu + ' not well known for ' + c.codes());
            }
          }
        }
      }
      return {
        text: 'Units ok for channels from ' + nets[0].stations[0].codes(),
        url: url,
        output: nets[0].stations[0].channels
      };
    });
  }
};
