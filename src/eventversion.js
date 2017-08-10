
import {fdsnevent}      from 'seisplotjs';
import {DS, EV, ST, serviceHost, doesSupport } from './util';


export let testEventVersion = {
  testname: "Event Version",
  testid: "eventversion",
  description: "Queries the version of the service, success as long as the query returns something",
  webservices: [ EV ],
  severity: 'severe',
  test: function(dc) {
    let host = serviceHost(dc, EV);

    let quakeQuery = new fdsnevent.EventQuery()
      .host(host);
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

