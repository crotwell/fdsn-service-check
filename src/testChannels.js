
import { fdsnevent, fdsnstation, fdsndataselect, RSVP } from 'seisplotjs';
import { DS, EV, ST, createQuery, doesSupport, randomNetwork, randomStation } from './util';

export const testChannels = {
  testname: 'Channels',
  testid: 'Channels',
  description: 'Queries for channels from a random unrestricted station within a random network returned from all networks, success as long as the query returns something, even an empty result.',
  webservices: [ST],
  severity: 'severe',
  test: function (dc) {
    return new RSVP.Promise(function (resolve, reject) {
      if (!doesSupport(dc, ST)) {
        reject(new Error('Unsupported'));
      } else {
        resolve(null);
      }
    }).then(function () {
      return randomNetwork(dc);
    }).then(function (net) {
      return randomStation(dc, net.networkCode);
    }).then(function (sta) {
      const chanQuery = createQuery(dc, ST)
        .networkCode(sta.network.networkCode)
        .stationCode(sta.stationCode);
      return chanQuery.queryChannels()
        .then(function (channels) {
          channels.url = chanQuery.formURL(fdsnstation.LEVEL_CHANNEL);
          return channels;
        });
    }).then(function (channels) {
      return {
        text: 'Found ' + channels.length,
        url: channels.url,
        output: channels
      };
    });
  }
};
