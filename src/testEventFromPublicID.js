
import {fdsnevent, fdsnstation, fdsndataselect} from 'seisplotjs';
import {DS, EV, ST, serviceHost, doesSupport } from './util';

let RSVP = fdsnstation.RSVP;

export let testEventFromPublicID = {
  testname: "eventid=publicID",
  testid: "eventid_publicid",
  description: "Queries events in the past 24 hours, then tries to make an eventid= query for the first event using its entire publicID with no modification. This allows a client to do a general then specific query style. Because the spec is ambiguous on the relationship between piblicID and eventid, this may be an unfair test, but I feel it is useful for the service to accept as eventid whatever it outputs as publicID.",
  webservices: [ EV ],
  severity: 'opinion',
  test: function(dc) {
    return new RSVP.Promise(function(resolve, reject) {
      if ( ! doesSupport(dc, EV) ) {
        reject(new Error("Unsupported"));
      } else {
        resolve(null);
      }
   }).then(function() {
    let daysAgo = .5;
    let host = serviceHost(dc, EV);
    let quakeQuery = new fdsnevent.EventQuery()
      .host(host)
      .startTime(new Date(new Date().getTime()-86400*daysAgo*1000))
      .endTime(new Date());
    let url = quakeQuery.formURL();
    return quakeQuery.query().then(function(quakes) {
        if (quakes.length == 0) {
          throw new Error("No quakes returned");
        }
        let singleQuakeQuery = new fdsnevent.EventQuery()
          .host(host)
          .eventid(encodeURIComponent(quakes[0].publicID));
        url = singleQuakeQuery.formURL();
        return singleQuakeQuery.query();
      }).then(function(singleQuake) {
        if (singleQuake.length === 1) {
          return {
            text: "Found "+singleQuake[0].time(),
            url: url,
            output: singleQuake
          };
        } else {
          throw new Error("Expect 1 event, received "+singleQuake.length);
        }
    }).catch(function(err) {
      if (! err.url) {err.url = url;}
      throw err;
    });
    });
  }
};

