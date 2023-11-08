
import { fdsnevent, fdsnstation, fdsndataselect } from 'seisplotjs';
import { DS, EV, ST, createQuery, doesSupport } from './util';

export const testNoData204Event = {
  testname: 'Event 204',
  testid: 'NoData204Event',
  description: 'Check that 204 is returned for queries for events that should be valid but return no data without nodata=404. Success if 204 http status is returned. This can also be a check on the CORS header.',
  webservices: [EV],
  severity: 'severe',
  test: function (dc) {
    return new Promise(function (resolve, reject) {
      if (!doesSupport(dc, EV)) {
        reject(new Error(EV + ' Unsupported by ' + dc.id));
      } else {
        resolve(null);
      }
    }).then(function () {
      const daysAgo = 1;
      const quakeQuery = createQuery(dc, EV)
        .startTime(new Date(new Date().getTime() - 86400 * daysAgo * 1000))
        .endTime(new Date())
        .minMag(99);
      const url = quakeQuery.formURL();
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
              reject(new Error('Should be no data, but received 200 http status code.'));
            } else if (this.status === 404) {
              reject(new Error('Should be 204 no data, but received 404 http status code.'));
            } else if (this.status === 204) {
              // 204 is nodata, so successful but empty
              resolve({
                text: '204 ',
                url: url,
                output: 204
              });
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
