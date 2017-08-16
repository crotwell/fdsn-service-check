
import {fdsnevent, fdsnstation, fdsndataselect} from 'seisplotjs';
import {DS, EV, ST, serviceHost, doesSupport } from './util';

let RSVP = fdsnstation.RSVP;

export let testNoDataNetwork = {
  testname: "NoData Networks",
  testid: "NoDataNetwork",
  description: "Queries for networks that should be well formed but return no networks, success as long as the query returns something, even an empty result. This can also be a check on the CORS header.",
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
      .host(host)
      .networkCode("xx");
    let url = query.formURL(fdsnstation.LEVEL_NETWORK);
    return query.queryNetworks().then(function(networks) {
      if (networks.length > 0) {
        throw new Error("Should be no data, but "+networks.length+" networks.");
      } else {
        return {
          text: "Found "+networks.length,
          url: url,
          output: networks
        };
      }
    }).catch(function(err) {
      if (! err.url) {err.url = url;}
      throw err;
    });
    });
  }
};

