
import {fdsnevent, fdsnstation, fdsndataselect} from 'seisplotjs';
import {DS, EV, ST, serviceHost, doesSupport, randomNetwork, randomStation } from './util';

let RSVP = fdsnstation.RSVP;

export let testSensitivityUnit = {
  testname: "Sensitvity units valid SI",
  testid: "sensitivityUnits",
  description: "Checks the units in the instrumentSensitivity against the validation list at https://github.com/iris-edu/StationXML-Validator/wiki/Unit-name-overview-for-IRIS-StationXML-validator",
  webservices: [ ST ],
  severity: 'opinion',
  test: function(dc) {
    let host = serviceHost(dc, ST);
    return new RSVP.Promise(function(resolve, reject) {
      if ( ! doesSupport(dc, ST) ) {
        reject(new Error("Unsupported"));
      } else {
        resolve(null);
      }
    }).then(function() {
      return randomNetwork(dc, new Date());
    }).then(function(net) {
      return randomStation(dc, net.networkCode(), new Date());
    }).then(function(station) {
      let query = new fdsnstation.StationQuery()
        .host(host)
        .networkCode(station.network().networkCode())
        .stationCode(station.stationCode()) ;
      return query.queryChannels()
        .then(function(nets) {
          nets.url = query.formURL(fdsnstation.LEVEL_CHANNEL);
          return nets;
        });
    }).then(function(nets) {
      return new Promise(function(resolve, reject){
        d3.json('knownUnits.json', function(error, knownUnits) {
          error ? reject(error) : resolve(knownUnits);
        });
      }).then(function(knownUnits) {
console.log("Units: "+knownUnits.units);
        return knownUnits.units;
      }).then(function(knownUnits) {
        for (let n of nets) {
          for (let s of n.stations()) {
console.log("Station: "+s.codes());
            for (let c of s.channels()) {
              let cu = c.instrumentSensitivity().inputUnits();
              let found = false;
              for (let u of knownUnits) {
                if (cu === u) {
                  found = true;
                  break;
                }
              }
              if (! found) {
                let foundLower = false;
                let cuLower = cu.toLowerCase();
                for (let u of knownUnits) {
                  if (cuLower === u.toLowerCase()) {
                    foundLower = true;
                    break;
                  }
                }
                let err = new Error("Unit "+cu+" not SI for "+c.codes());
                if (foundLower) {
                  err = new Error("Unit "+cu+" wrong case for SI in "+c.codes());
                }
                err.url = nets.url;
                throw err;
              }

              cu = c.instrumentSensitivity().outputUnits();
              found = false;
              for (let u of knownUnits) {
                if (cu === u) {
                  found = true;
                  break;
                }
              }
              if (! found) {
                throw new Error("Unit "+cu+" not well known for "+c.codes());
              }
            }
          }
        }
        return {
          text: "Units ok for channels from "+station.codes(),
          url: channels.url,
          output: channels
        };
      });
    });
  }
};

