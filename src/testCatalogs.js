
import {fdsnevent, fdsnstation, fdsndataselect} from 'seisplotjs';
import {DS, EV, ST, serviceHost, doesSupport } from './util';

let RSVP = fdsnstation.RSVP;

export let testCatalogs = {
  testname: "Catalogs",
  testid: "catalogs",
  description: "Queries the list of catalogs of the event service, success as long as the query returns something",
  webservices: [ EV ],
  severity: 'severe',
  test: function(dc) {
    return new RSVP.Promise(function(resolve, reject) {
    if ( ! doesSupport(dc, EV) ) {
      reject(new Error("Unsupported"));
    } else {
      resolve(null);
    }
   }).then(function() {
    let host = serviceHost(dc, EV);
    let quakeQuery = new fdsnevent.EventQuery()
      .host(host);
    let url = quakeQuery.formCatalogsURL();
    return quakeQuery.queryCatalogs().then(function(catalogs) {
      return {
        text: "Found "+catalogs.length,
        url: url,
        output: catalogs
      };
    }).catch(function(err) {
      if (! err.url) {err.url = url;}
      throw err;
    });
    });
  }
};
