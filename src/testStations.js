
import {fdsnevent, fdsnstation, fdsndataselect} from 'seisplotjs';
import {DS, EV, ST, serviceHost, doesSupport, randomNetwork, randomStation } from './util';

let RSVP = fdsnstation.RSVP;

export let testStations = {
  testname: "Stations",
  testid: "stations",
  description: "Queries for stations within a random unrestricted network returned from all networks, success as long as the query returns something, even an empty result.",
  webservices: [ ST ],
  severity: 'severe',
  test: function(dc) {
    return new RSVP.Promise(function(resolve, reject) {
      if ( ! doesSupport(dc, ST) ) {
        reject(new Error("Unsupported"));
      } else {
        resolve(null);
      }
    }).then(function() {
      return randomNetwork(dc);
    }).then(function(net) {
      return randomStation(dc, net.networkCode());
    }).then(function(sta) {
      return {
        text: "Found "+sta.codes(),
        url: sta.url,
        output: sta
      };
    });
  }
};
