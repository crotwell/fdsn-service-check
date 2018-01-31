
import {fdsnevent, fdsnstation, fdsndataselect} from 'seisplotjs';
import {DS, EV, ST, serviceHost, doesSupport } from './util';

let RSVP = fdsnstation.RSVP;

export let testEventFractionalSeconds = {
  testname: "Event Fractional Seconds",
  testid: "EventFractionalSeconds",
  description: "Queries for events using start and end times with fractional seconds",
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
    let daysAgo = 1;
    let host = serviceHost(dc, EV);
    let quakeQuery = new fdsnevent.EventQuery()
      .host(host)
      .startTime('2017-01-01T12:34:56.789')
      .endTime('2017-01-05T00:00:00.123')
      .minMag(5);
    let url = quakeQuery.formURL();
    return new Promise(function(resolve, reject) {
        let client = new XMLHttpRequest();
        client.open("GET", url);
        client.onreadystatechange = handler;
        client.responseType = "document";
        client.setRequestHeader("Accept", "application/xml");
        client.send();

        function handler() {
          if (this.readyState === this.DONE) {
            // ok even if no data returned
            if (this.status === 200 || this.status === 404 || this.status === 204) {
              resolve( {
                text: "Response OK ",
                url: url,
                output: this.responseXML
              });
            } else if (this.status === 400 ) {
              reject(new Error("Bad request, "+this.status));
            } else {
              let error = new Error("Unexpected http status code: "+this.status);
              error.status = this.status;
              error.statusText = this.statusText;
              reject(error);
            }
          }
        }
      }).catch(function(err) {
        if (! err.url) {err.url = url;}
        throw err;
      });
    });
  }
};
