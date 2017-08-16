
import {fdsnevent, fdsnstation, fdsndataselect} from 'seisplotjs';
import {DS, EV, ST, serviceHost, doesSupport } from './util';

let RSVP = fdsnstation.RSVP;

export let testNoDataEvent = {
  testname: "NoData Event",
  testid: "NoDataEvent",
  description: "Queries for events that should be valid but return no data. Success if nothing is returned. This can also be a check on the CORS header.",
  webservices: [ EV ],
  severity: 'severe',
  test: function(dc) {
    return new RSVP.Promise(function(resolve, reject) {
    if ( ! doesSupport(dc, EV) ) {
      reject(new Error(EV+" Unsupported by "+dc.id));
    } else {
      resolve(null);
    }
   }).then(function() {
    let daysAgo = 1;
    let host = serviceHost(dc, EV);
    let quakeQuery = new fdsnevent.EventQuery()
      .host(host)
      .startTime(new Date(new Date().getTime()-86400*daysAgo*1000))
      .endTime(new Date())
      .minMag(99);
    let url = quakeQuery.formURL();
    return quakeQuery.query().then(function(quakes) {
      if (quakes.length > 0) {
        throw new Error("Should be no data, but "+quakes.length+" events.");
      } else {
        return {
          text: "Found "+quakes.length,
          url: url,
          output: quakes
        };
      }
    }).catch(function(err) {
      if (! err.url) {err.url = url;}
      throw err;
    });
    });
  }
};
