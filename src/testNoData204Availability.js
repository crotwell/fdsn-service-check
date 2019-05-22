
import {fdsnavailability, fdsnstation, fdsndataselect, RSVP} from 'seisplotjs';
import {AV, DS, EV, ST, createQuery, doesSupport } from './util';


export let testNoData204Availability = {
  testname: "Availability 204",
  testid: "NoData204Availability",
  description: "Check that 204 is returned for queries for availability that should be valid but return no data without nodata=404. Success if 204 http status is returned. This can also be a check on the CORS header.",
  webservices: [ AV ],
  severity: 'severe',
  test: function(dc) {
    return new RSVP.Promise(function(resolve, reject) {
    if ( ! doesSupport(dc, AV) ) {
      reject(new Error(AV+" Unsupported by "+dc.id));
    } else {
      resolve(null);
    }
   }).then(function() {
    let query = createQuery(dc, AV);
    let url = query
      .networkCode("XX")
      .stationCode("ABC")
      .locationCode("99")
      .channelCode("XXX")
      .computeStartEnd(new Date(Date.UTC(1980,1,1,0,0,0)), null, 300, 0)
      .formURL();
    return new Promise(function(resolve, reject) {
        let client = new XMLHttpRequest();
        client.open("GET", url);
        client.onreadystatechange = handler;
        client.responseType = "arraybuffer";
        client.setRequestHeader("Accept", "application/xml");
        client.send();

        function handler() {
          if (this.readyState === this.DONE) {
            if (this.status === 200) {
              reject(new Error("Should be no data, but received 200 http status code."));
            } else if (this.status === 404 ) {
              reject(new Error("Should be 204 no data, but received 404 http status code."));
            } else if (this.status === 204 ) {
              // 204 is nodata, so successful but empty
                resolve({
                  text: "204 ",
                  url: url,
                  output: 204
                });
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
