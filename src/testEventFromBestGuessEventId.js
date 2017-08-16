
import {fdsnevent, fdsnstation, fdsndataselect} from 'seisplotjs';
import {DS, EV, ST, serviceHost, doesSupport } from './util';

let RSVP = fdsnstation.RSVP;

export let testEventFromBestGuessEventId = {
  testname: "Best Guess EventId",
  testid: "EventFromBestGuessEventId",
  description: "Queries events in the past 24 hours, then tries to make an eventid= query for the first event using a huristic to determine the eventid. This allows a client to do a general then specific query style, but with more effort than eventid=publicID as the client must guess the value for eventid in the specific query. This is also fragile as the huristic must be updated for each new server.",
  webservices: [ EV ],
  severity: 'severe',
  test: function(dc) {
    let url = "none";
    let daysAgo = .5;
    let host = serviceHost(dc, EV);
    return new RSVP.Promise(function(resolve, reject) {
      if ( ! doesSupport(dc, EV) ) {
        reject(new Error("Unsupported"));
      } else {
        host = serviceHost(dc, EV);
        resolve(host);
      }
    }).then(function(host) {
      let quakeQuery = new fdsnevent.EventQuery()
        .host(host)
        .startTime(new Date(new Date().getTime()-86400*daysAgo*1000))
        .endTime(new Date());
      url = quakeQuery.formURL();
      return quakeQuery.query();
    }).then(function(quakes) {
        if (quakes.length == 0) {
          throw new Error("No quakes returned");
        }
        let singleQuakeQuery = new fdsnevent.EventQuery()
          .host(host)
          .eventid(encodeURIComponent(quakes[0].eventid()));
        url = singleQuakeQuery.formURL();
        return singleQuakeQuery.query();
    }).then(function(quakes) {
      return {
        text: "Found "+quakes.length,
        url: url,
        output: quakes
      };
    }).catch(function(err) {
      if (! err.url) {err.url = url;}
      throw err;
    });
  }
};
