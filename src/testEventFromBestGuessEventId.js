
import { fdsnevent, fdsnstation, fdsndataselect, RSVP } from 'seisplotjs';
import { DS, EV, ST, createQuery, doesSupport } from './util';

export const testEventFromBestGuessEventId = {
  testname: 'Best Guess EventId',
  testid: 'EventFromBestGuessEventId',
  description: 'Queries events in the past 24 hours, then tries to make an eventid= query for the first event using a huristic to determine the eventid. This allows a client to do a general then specific query style, but with more effort than eventid=publicID as the client must guess the value for eventid in the specific query. This is also fragile as the huristic must be updated for each new server.',
  webservices: [EV],
  severity: 'severe',
  test: function (dc) {
    let url = 'none';
    const daysAgo = 0.5;
    return new RSVP.Promise(function (resolve, reject) {
      if (!doesSupport(dc, EV)) {
        reject(new Error('Unsupported'));
      } else {
        resolve();
      }
    }).then(function () {
      const quakeQuery = createQuery(dc, EV)
        .startTime(new Date(new Date().getTime() - 86400 * daysAgo * 1000))
        .endTime(new Date());
      url = quakeQuery.formURL();
      console.log('event for eventid test: ' + url);
      return quakeQuery.query();
    }).then(function (quakes) {
      if (quakes.length == 0) {
        throw new Error('No quakes returned');
      }
      const singleQuakeQuery = createQuery(dc, EV)
        .eventId(encodeURIComponent(quakes[0].eventId));
      url = singleQuakeQuery.formURL();
      return singleQuakeQuery.query();
    }).then(function (quakes) {
      return {
        text: 'Found ' + quakes.length,
        url: url,
        output: quakes
      };
    }).catch(function (err) {
      if (!err.url) { err.url = url; }
      throw err;
    });
  }
};
