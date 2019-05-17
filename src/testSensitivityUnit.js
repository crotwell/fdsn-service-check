
import {fdsnevent, fdsnstation, fdsndataselect, RSVP} from 'seisplotjs';
import {DS, EV, ST, createQuery, doesSupport, randomNetwork, randomStation } from './util';


export let testSensitivityUnit = {
  testname: "Sensitvity units valid SI",
  testid: "SensitivityUnit",
  description: "Checks the units in the instrumentSensitivity against the validation list at https://github.com/iris-edu/StationXML-Validator/wiki/Unit-name-overview-for-IRIS-StationXML-validator",
  webservices: [ ST ],
  severity: 'opinion',
  test: function(dc) {
    return new RSVP.Promise(function(resolve, reject) {
      if ( ! doesSupport(dc, ST) ) {
        reject(new Error("Unsupported"));
      } else {
        resolve(null);
      }
    }).then(function() {
      return randomNetwork(dc, new Date());
    }).then(function(net) {
      return randomStation(dc, net.networkCode, new Date());
    }).then(function(station) {
      let query = createQuery(dc, ST)
        .networkCode(station.network.networkCode)
        .stationCode(station.stationCode) ;
      return RSVP.hash({
        "query": query,
        "nets": query.queryChannels()
        });
    }).then(function(hash) {
        hash.knownUnits = fetch('knownUnits.json').then(function(response) {
                        return response.json();
                      });
        hash.url = hash.query.formURL(fdsnstation.LEVEL_CHANNEL);
        return RSVP.hash(hash);
    }).then(function(hash) {
      console.log("hash knownUnits: "+hash.knownUnits);
        const knownUnits = hash.knownUnits.units;
        const nets = hash.nets;
        console.log("Units: "+knownUnits);
        for (let n of nets) {
          for (let s of n.stations) {
console.log("Station: "+s.codes());
            for (let c of s.channels) {
              let cu = c.instrumentSensitivity.inputUnits;
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

              cu = c.instrumentSensitivity.outputUnits;
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
          text: "Units ok for channels from "+nets[0].stations[0].codes(),
          url: hash.url,
          output: nets[0].stations[0].channels
        };
      });
  }
};
