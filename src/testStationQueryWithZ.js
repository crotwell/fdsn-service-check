
import {fdsnevent, fdsnstation, fdsndataselect} from 'seisplotjs';
import {DS, EV, ST, serviceHost, doesSupport, randomNetwork } from './util';

let RSVP = fdsnstation.RSVP;

export let testStationQueryWithZ = {
  testname: "Starttime Query With Z",
  testid: "stationqueryZ",
  description: "Queries for stations with starttime of 2016-01-01 using a time that ends with Z",
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
      return randomNetwork(dc);
    }).then(function(net) {
      let start = net.startDate();
      start.setMilliseconds(789);
      let end = net.endDate() ? net.endDate() : new Date();
      end.setMilliseconds(789);
      let host = serviceHost(dc, ST);
      let query = new fdsnstation.StationQuery()
        .host(host)
        .networkCode(net.networkCode())
        .startTime(start)
        .endTime(new Date(new Date()));
      // millis is 789, so replace with 789Z
      let url = query.formURL(fdsnstation.LEVEL_STATION).replace('.789', '.789Z');
      return new Promise(function(resolve, reject) {
        let client = new XMLHttpRequest();
        client.open("GET", url);
        client.onreadystatechange = handler;
        client.responseType = "document";
        client.setRequestHeader("Accept", "application/xml");
        client.send();

        function handler() {
          if (this.readyState === this.DONE) {
            if (this.status === 200) {
                resolve(this.responseXML);
            } else if (this.status === 404 || this.status === 204) {
              reject(new Error("Should be 200 , but received no data, "+this.status));
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
      }).then(function(responseXML) {
        return {
          text: "Response OK ",
          url: url,
          output: responseXML
        };
      }).catch(function(err) {
        if (! err.url) {err.url = url;}
        throw err;
      });
    });
  }
};

