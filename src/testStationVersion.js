
import {fdsnevent, fdsnstation, fdsndataselect} from 'seisplotjs';
import {DS, EV, ST, serviceHost, doesSupport } from './util';


export let testStationVersion = {
  testname: "Station Version",
  testid: "StationVersion",
  description: "Queries the version of the service, success as long as the query returns something",
  webservices: [ ST ],
  severity: 'severe',
  test: function(dc) {
    let host = serviceHost(dc, ST);

    let query = new fdsnstation.StationQuery()
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
