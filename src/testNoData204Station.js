
import { fdsnevent, fdsnstation, fdsndataselect, RSVP } from 'seisplotjs';
import { DS, EV, ST, createQuery, doesSupport } from './util';

export const testNoData204Station = {
  testname: 'Station 204',
  testid: 'NoData204Station',
  description: 'Check that 204 is returned for queries for networks that should be valid but return no data, without nodata=404. Success if 204 http status is returned. This can also be a check on the CORS header.',
  webservices: [ST],
  severity: 'severe',
  test: function (dc) {
    return new RSVP.Promise(function (resolve, reject) {
      if (!doesSupport(dc, ST)) {
        reject(new Error(ST + ' Unsupported by ' + dc.id));
      } else {
        resolve(null);
      }
    }).then(function () {
      const query = createQuery(dc, ST)
        .networkCode('xx');
      const url = query.formURL(fdsnstation.LEVEL_NETWORK);
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
              reject(new Error('Should be no data, but got 200 http status code'));
            } else if (this.status === 404) {
              reject(new Error('Should be 204 no data, but received 404.'));
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
