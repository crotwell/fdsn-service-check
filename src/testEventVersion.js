
import {fdsnevent}      from 'seisplotjs';
import {DS, EV, ST, createQuery, doesSupport } from './util';


export let testEventVersion = {
  testname: "Event Version",
  testid: "EventVersion",
  description: "Queries the version of the service, success as long as the query returns something",
  webservices: [ EV ],
  severity: 'severe',
  test: function(dc) {
    let quakeQuery = createQuery(dc, EV);
    let url = quakeQuery.formVersionURL();
    return quakeQuery.queryVersion().then(function(version) {
      return {
        text: version,
        output: version,
        url: url
      };
    }).catch(function(err) {
      if (! err.url) {err.url = url;}
      throw err;
    });
  }
};
