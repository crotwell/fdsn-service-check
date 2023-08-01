
import { fdsnevent, fdsnstation, fdsndataselect } from 'seisplotjs';
import { DS, EV, ST, createQuery, doesSupport } from './util';

export const testEventVersion = {
  testname: 'Event Version',
  testid: 'eventversion',
  description: 'Queries the version of the service, success as long as the query returns something',
  webservices: [EV],
  severity: 'severe',
  test: function (dc) {
    const quakeQuery = createQuery(dc, EV);
    const url = quakeQuery.formVersionURL();
    return quakeQuery.queryVersion().then(function (version) {
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
