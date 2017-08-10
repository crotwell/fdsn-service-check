
import {fdsnevent, fdsnstation, fdsndataselect} from 'seisplotjs';
import {DS, EV, ST, serviceHost, doesSupport } from './util';

let RSVP = fdsnstation.RSVP;

export let testNetworks = {
  testname: "Networks",
  testid: "networks",
  description: "Queries for all networks, success as long as the query returns something, even an empty result.",
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
    let host = serviceHost(dc, ST);
    let query = new fdsnstation.StationQuery()
      .host(host);
    let url = query.formURL(fdsnstation.LEVEL_NETWORK);
    return query.queryNetworks().then(function(networks) {
      return {
        text: "Found "+networks.length,
        url: url,
        output: networks
      };
    }).catch(function(err) {
      if (! err.url) {err.url = url;}
      throw err;
    });
    });
  }
};

