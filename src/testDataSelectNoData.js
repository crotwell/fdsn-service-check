
import {fdsnevent, fdsnstation, fdsndataselect, RSVP} from 'seisplotjs';
import {DS, EV, ST, createQuery, doesSupport } from './util';


export let testDataSelectNoData = {
  testname: "No Data",
  testid: "DataSelectNoData",
  description: "Attempts to make a dataselect query that should be correctly formed but should not return data. Success as long as the query returns, even with an empty result. This can also be a check on the CORS header.",
  webservices: [ DS ],
  severity: 'severe',
  test: function(dc) {
    return new RSVP.Promise(function(resolve, reject) {
    if ( ! doesSupport(dc, DS) || ! doesSupport(dc, ST) ) {
      reject(new Error("Unsupported"));
    } else {
      resolve(null);
    }
   }).then(function() {
    let query = createQuery(dc, DS);
    let url = query
      .networkCode("XX")
      .stationCode("ABC")
      .locationCode("99")
      .channelCode("XXX")
      .computeStartEnd(new Date(Date.UTC(1980,1,1,0,0,0)), null, 300, 0)
      .formURL();
    return query.query().then(function(miniseed) {
      if (miniseed.length > 0) {
        throw new Error("Should be no data, but "+miniseed.length+" miniseed records.");
      } else {
        return {
          text: "Found "+miniseed.length,
          url: url,
          output: miniseed
        };
      }
    }).catch(function(err) {
      if (! err.url) {err.url = url;}
      throw err;
    });
    });
  }
};
