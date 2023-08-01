
import { fdsnevent, fdsnstation, fdsndataselect, quakeml, RSVP } from 'seisplotjs';
import { DS, EV, ST, createQuery, doesSupport } from './util';

export const testDateIncludeZ = {
  testname: 'Date Ends w/ Z',
  testid: 'DateIncludeZ',
  description: 'Queries for events in the past 24 hours and checks that the origin time string ends with a Z for UTC timezone.',
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
      const daysAgo = 1;
      const quakeQuery = createQuery(dc, EV)
        .startTime(new Date(new Date().getTime() - 86400 * daysAgo * 1000))
        .endTime(new Date());
      const url = quakeQuery.formURL();
      return quakeQuery.queryRawXml().then(function (qml) {
        const top = qml.documentElement;
        const eventArray = Array.prototype.slice.call(top.getElementsByTagName('event'));
        if (eventArray.length === 0) {
          throw new Error('No events returned');
        }
        let failureEvent = null;
        let otimeStr = null;
        if (eventArray.every(function (q, i) {
          otimeStr = quakeml.parseUtil._grabFirstElText(quakeml.parseUtil._grabFirstEl(quakeml.parseUtil._grabFirstEl(qml, 'origin'), 'time'), 'value');
          if (otimeStr) {
            if (otimeStr.charAt(otimeStr.length - 1) === 'Z') {
              return true;
            } else {
              failureEvent = q;
              return false;
            }
          } else {
            const err = new Error('origintime is missing for ' + i + 'th event: ' + q.getAttribute('publicID'));
            err.url = url;
            throw err;
          }
        })) {
          return {
            text: 'Found ' + eventArray.length,
            url: url,
            output: qml
          };
        } else {
          throw new Error('Check for Z failed for ' + otimeStr + ', event: ' + failureEvent.getAttribute('publicID'));
        }
      }).catch(function (err) {
        if (!err.url) { err.url = url; }
        throw err;
      });
    });
  }
};
