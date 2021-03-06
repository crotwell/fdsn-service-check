
import {fdsnevent, fdsnstation, fdsndataselect, util, RSVP} from 'seisplotjs';
import {DS, EV, ST, createQuery, doesSupport, randomNetwork, randomStation } from './util';


export let testDataSelectFormat = {
  testname: "Format as miniseed",
  testid: "DataSelectFormat",
  description: "Attempts to make a dataselect query including format=miniseed, by first querying for networks, then stations within the a random network and then using a random station to request the last 300 seconds for a SHZ,BHZ channel. Success as long as the query returns, even with an empty result.",
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
     return randomStation(dc, net.networkCode, new Date());
   }).then(function(station) {
    let query = createQuery(dc, DS);
    let url = query
      .networkCode(station.network.networkCode)
      .stationCode(station.stationCode)
      .channelCode("SHZ,BHZ")
      .timeWindow(new util.StartEndDuration(null, null, 300))
      .format("miniseed")
      .formURL();
    return query.queryDataRecords().then(function(miniseed) {
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
