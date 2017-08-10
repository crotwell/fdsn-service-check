
import {fdsnevent, fdsnstation, fdsndataselect} from 'seisplotjs';
import {DS, EV, ST, serviceHost, doesSupport, randomNetwork, randomStation } from './util';

let RSVP = fdsnstation.RSVP;

export let testDataSelectRecent = {
  testname: "Recent Data",
  testid: "recentData",
  description: "Attempts to make a dataselect query by first querying for networks, then stations within the a random network and then using a random station to request the last 300 seconds for a SHZ,BHZ channel. Success as long as the query returns, even with an empty result.",
  webservices: [ ST, DS ],
  severity: 'severe',
  test: function(dc) {
    return new RSVP.Promise(function(resolve, reject) {
    if ( ! doesSupport(dc, DS) || ! doesSupport(dc, ST) ) {
      reject(new Error("Unsupported"));
    } else {
      resolve(null);
    }
   }).then(function() {
    return randomNetwork(dc, new Date());
   }).then(function(net) {
     return randomStation(dc, net.networkCode(), new Date());
   }).then(function(station) {
    let host = serviceHost(dc, DS);

    let query = new fdsndataselect.DataSelectQuery()
      .host(host);
    let url = query
      .networkCode(station.network().networkCode())
      .stationCode(station.stationCode())
      .channelCode("SHZ,BHZ")
      .computeStartEnd(null, new Date(), 300, 0)
      .formURL();
    return query.query().then(function(miniseed) {
      return {
        text: "Found "+miniseed.length,
        url: url,
        output: miniseed
      };
    }).catch(function(err) {
      if (! err.url) {err.url = url;}
      throw err;
    });
    });
  }
};
