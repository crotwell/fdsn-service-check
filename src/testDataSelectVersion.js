
import { fdsnevent, fdsnstation, fdsndataselect, RSVP } from 'seisplotjs';
import { DS, EV, ST, createQuery, doesSupport } from './util';

export const testDataSelectVersion = {
  testname: 'DataSelect Version',
  testid: 'DataSelectVersion',
  description: 'Queries the version of the service, success as long as the query returns something',
  webservices: [DS],
  severity: 'severe',
  test: function (dc) {
    const query = createQuery(dc, DS);
    const url = query.formVersionURL();
    return query.queryVersion().then(function (version) {
      return {
        text: version,
        output: version,
        url: url
      };
    }).catch(function (err) {
      if (!err.url) { err.url = url; }
      throw err;
    });
  }
};
