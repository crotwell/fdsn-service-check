
import { fdsnevent, fdsnstation, fdsndataselect, luxon } from 'seisplotjs';
import { DS, EV, ST, createQuery, doesSupport, randomNetwork, randomStation } from './util';

export const testStationNowEndTime = {
  testname: 'Station With Endtime of now',
  testid: 'StationNowEndTime',
  description: 'Queries for channels for a random station with both endtime = now',
  webservices: [ST],
  severity: 'severe',
  test: function(dc) {
    const now = luxon.datetime.utc();
    let url = null;
    return new Promise(function(resolve, reject) {
      if (!doesSupport(dc, ST)) {
        reject(new Error('Unsupported'));
      } else {
        resolve(null);
      }
    }).then(function() {
      return randomNetwork(dc, now);
    }).then(function(net) {
      if (!net) { throw new Error('Did not find a network'); }
      return randomStation(dc, net.networkCode, now);
    }).then(function(randomStation, now) {
      if (!randomStation) { throw new Error(`Did not find a station within ${net.networkCode}`); }
      const stationQuery = createQuery(dc, ST);

      // stationQuery.networkCode(randomStation.network.networkCode);
      // stationQuery.stationCode(randomStation.stationCode);
      // stationQuery.endTime(now);
      stationQuery.networkCode(randomStation.network.networkCode)
        .stationCode(randomStation.stationCode)
        .endTime(now);
      url = stationQuery.formURL(fdsnstation.LEVEL_STATION);
      console.log("xxxxx url="+url)
      const nets = stationQuery.queryChannels();
      return Promise.all([url, stationQuery, nets]);
    }).then(([url, stationQuery, nets]) => {
      return {
        url: url,
        query: stationQuery,
        nets: nets
      };
    }).then(function(hash) {
      if (!hash.nets ||
        hash.nets.length === 0 ||
        hash.nets[0].stations.length === 0 ||
        !hash.nets[0].stations[0]) {
        const err = new Error(`no station returned for channel query with endTime=${now.toISO()} for ${hash.url}`);
        err.url = hash.url;
        throw err;
      }
      hash.station = hash.nets[0].stations[0];
      if (hash.station.channels.length > 0) {
        return {
          text: 'Found ' + hash.station.channels.length,
          url: hash.url,
          output: hash
        };
      } else {
        const err = new Error(`station ${hash.station.codes()} has no channels for endTime=${now}`);
        err.url = hash.url;
        throw err;
      }
    }).catch(function(err) {
      if (!err.url) { err.url = url; }
      throw err;
    });
  }
};
