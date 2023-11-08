
import { fdsnevent, fdsnstation, fdsndataselect } from 'seisplotjs';
import { DS, EV, ST, createQuery, doesSupport, randomNetwork } from './util';

export const testStationQueryWithZ = {
  testname: 'Starttime Query With Z',
  testid: 'StationQueryWithZ',
  description: 'Queries for stations with starttime of 2016-01-01 using a time that ends with Z',
  webservices: [ST],
  severity: 'opinion',
  test: function (dc) {
    return new Promise(function (resolve, reject) {
      if (!doesSupport(dc, ST)) {
        reject(new Error('Unsupported'));
      } else {
        resolve(null);
      }
    }).then(function () {
      return randomNetwork(dc);
    }).then(function (net) {
      const start = net.startDate;
      start.milliseconds(789);
      const end = net.endDate ? net.endDate : moment.utc();
      end.milliseconds(789);
      const query = createQuery(dc, ST)
        .networkCode(net.networkCode)
        .startTime(start)
        .endTime(end);
      // millis is 789, so replace with 789Z
      const url = query.formURL(fdsnstation.LEVEL_STATION).replace('.789', '.789Z');
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
              resolve(this.responseXML);
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
      }).then(function (responseXML) {
        return {
          text: 'Response OK ',
          url: url,
          output: responseXML
        };
      }).catch(function (err) {
        if (!err.url) { err.url = url; }
        throw err;
      });
    });
  }
};
