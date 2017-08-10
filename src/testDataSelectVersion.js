
import {fdsnevent, fdsnstation, fdsndataselect} from 'seisplotjs';
import {DS, EV, ST, serviceHost, doesSupport } from './util';


export let testDataSelectVersion = {
  testname: "DataSelect Version",
  testid: "dataselectversion",
  description: "Queries the version of the service, success as long as the query returns something",
  webservices: [ DS ],
  severity: 'severe',
  test: function(dc) {
    let host = serviceHost(dc, DS);

    let query = new fdsndataselect.DataSelectQuery()
      .host(host);
    let url = query.formVersionURL();
    return query.queryVersion().then(function(version) {
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
