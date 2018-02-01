
import {fdsnevent, fdsnstation, fdsndataselect} from 'seisplotjs';
import {DS, EV, ST, serviceHost, doesSupport, randomNetwork, randomStation } from './util';

let RSVP = fdsnstation.RSVP;

export let testSimpleAndWindowTimes = {
  testname: "Simple and Window Times",
  testid: "SimpleAndWindowTimes",
  description: "Queries for channels for a random station with both starttime and endafter",
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
   }).then(function(randomStation) {
    let host = serviceHost(dc, ST);
    let query = new fdsnstation.StationQuery()
    let stationQuery = new fdsnstation.StationQuery();
      stationQuery.host(host)
      .networkCode(randomStation.network().networkCode())
      .stationCode(randomStation.stationCode())
      .startTime(randomStation.startDate())
      .endAfter(randomStation.startDate());
    let url = stationQuery.formURL(fdsnstation.LEVEL_STATION);
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
            if (this.status === 200) {
              resolve( {
                text: "Response OK ",
                url: url,
                output: this.responseXML
              });
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
      }).catch(function(err) {
        if (! err.url) {err.url = url;}
        throw err;
      });
    });
  }
};
