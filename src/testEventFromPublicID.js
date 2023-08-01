
import { fdsnevent, fdsnstation, fdsndataselect, RSVP } from 'seisplotjs';
import { DS, EV, ST, createQuery, doesSupport } from './util';

export const testEventFromPublicID = {
  testname: 'eventid=publicID',
  testid: 'EventFromPublicID',
  description: 'Queries events in the past 24 hours, then tries to make an eventid= query for the first event using its entire publicID with no modification. This allows a client to do a general then specific query style. Because the spec is ambiguous on the relationship between piblicID and eventid, this may be an unfair test, but I feel it is useful for the service to accept as eventid whatever it outputs as publicID.',
  webservices: [EV],
  severity: 'opinion',
  test: function (dc) {
    return new RSVP.Promise(function (resolve, reject) {
      if (!doesSupport(dc, EV)) {
        reject(new Error('Unsupported'));
      } else {
        resolve(null);
      }
    }).then(function () {
      const daysAgo = 0.5;
      const quakeQuery = createQuery(dc, EV)
        .startTime(new Date(new Date().getTime() - 86400 * daysAgo * 1000))
        .endTime(new Date());
      let url = quakeQuery.formURL();
      return quakeQuery.query().then(function (quakes) {
        if (quakes.length == 0) {
          throw new Error('No quakes returned');
        }
        const singleQuakeQuery = createQuery(dc, EV)
          .eventId(encodeURIComponent(quakes[0].publicId));
        url = singleQuakeQuery.formURL();
        return singleQuakeQuery.query();
      }).then(function (singleQuake) {
        if (singleQuake.length === 1) {
          return {
            text: 'Found ' + singleQuake[0].time(),
            url: url,
            output: singleQuake
          };
        } else {
          throw new Error('Expect 1 event, received ' + singleQuake.length);
        }
      }).catch(function (err) {
        if (!err.url) { err.url = url; }
        throw err;
      });
    });
  }
};
