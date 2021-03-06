
import {fdsnevent, fdsnstation, fdsndataselect, RSVP} from 'seisplotjs';
import {DS, EV, ST, createQuery, doesSupport, randomNetwork, randomStation } from './util';


export let testStationCrossDateLine = {
  testname: "Station Cross Date Line",
  testid: "StationCrossDateLine",
  description: "Queries for stations in a region that crosses the date line, ie minlon > maxlon",
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
      return randomStation(dc, net.networkCode);
   }).then(function(randomStation) {
      let query = createQuery(dc, ST);
    let stationQuery = createQuery(dc, ST)
      .networkCode(randomStation.network.networkCode)
      .minLat(randomStation.latitude-1)
      .maxLat(randomStation.latitude+1)
      .minLon(randomStation.longitude+2)
      .maxLon(randomStation.longitude+1);
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
