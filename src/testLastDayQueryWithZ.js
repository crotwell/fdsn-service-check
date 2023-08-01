
import { fdsnevent, fdsnstation, fdsndataselect, RSVP } from 'seisplotjs';
import { DS, EV, ST, createQuery, doesSupport } from './util';

export const testLastDayQueryWithZ = {
  testname: 'Last Day Query With Z',
  testid: 'LastDayQueryWithZ',
  description: 'Queries for events in the past 24 hours using a time that ends with Z',
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
        .startTime(new Date(Date.parse('2017-01-01T12:34:56.789')))
        .endTime(new Date(Date.parse('2017-01-05T00:00:00.000')));
      const url = quakeQuery.formURL().replace('.789', '.789Z').replace('.000', '.000Z');
      return new Promise(function (resolve, reject) {
        const client = new XMLHttpRequest();
        client.open('GET', url);
        client.onreadystatechange = handler;
        client.responseType = 'document';
        client.setRequestHeader('Accept', 'application/xml');
        client.send();

        function handler () {
          if (this.readyState === this.DONE) {
            if (this.status === 200) {
              resolve({
                text: 'Response OK ',
                url: url,
                output: this.responseXML
              });
            } else if (this.status === 404 || this.status === 204) {
              reject(new Error('Should be 200 , but received no data, ' + this.status));
            } else if (this.status === 400) {
              reject(new Error('Bad request, ' + this.status));
            } else {
              const error = new Error('Unexpected http status code: ' + this.status);
              error.status = this.status;
              error.statusText = this.statusText;
              reject(error);
            }
          }
        }
      }).catch(function (err) {
        if (!err.url) { err.url = url; }
        throw err;
      });
    });
  }
};
