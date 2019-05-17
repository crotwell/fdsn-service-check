import * as seisplotjs from 'seisplotjs';

let fdsnevent = seisplotjs.fdsnevent;
let fdsnstation = seisplotjs.fdsnstation;
let fdsndataselect = seisplotjs.fdsndataselect;
let RSVP = seisplotjs.RSVP;

export function githubTestURL(testid) {
  return "https://github.com/crotwell/fdsn-service-check/blob/master/src/test"+testid+".js";
}

export function findSupport(dc, type) {
  return dc.supports.find(function(s) { return s.type === type;});
}

export function doesSupport(dc, type) {
  let out = dc.supports.find(function(s) { return s.type === type;});
  return typeof out != 'undefined';
}

export function serviceHost(dc, type) {
  let does = findSupport(dc, type);
  if (does) {
    return does.host ? does.host : dc.host;
  }
  return null;
}

export function servicePort(dc, type) {
  let does = findSupport(dc, type);
  if (does) {
    return does.port ? does.port : 80;
  }
  return null;
}

export function createQuery(dc, type) {
  let q = null;
  if (type === DS) {
    q = new fdsndataselect.DataSelectQuery();
  } else if (type === EV) {
    q = new fdsnevent.EventQuery();
  } else if (type === ST) {
    q = new fdsnstation.StationQuery();
  } else {
    throw new Error("Unkown type: "+type);
  }
  q.host(serviceHost(dc, type));
  q.port(servicePort(dc, type));
  return q;
}

export const DS = "fdsnws-dataselect";
export const EV = "fdsn-event";
export const ST = "fdsn-station";

export function randomNetwork(dc, startTime) {
  let query = createQuery(dc, ST);
  if (startTime) {
    query.startTime(startTime);
  }
  let url = query.formURL(fdsnstation.LEVEL_NETWORK);
  return query.queryNetworks().then(function(networks) {
    if (networks.length == 0) {
      let err = new Error("No networks");
      err.url = url;
      throw err;
    }
    // got some nets
    let permNetRE = /[A-W][A-Z0-9]/;
    let unrestricted = networks.filter(function(net) {
      return  (( ! net.restrictedStatus || net.restrictedStatus == "open")
             && permNetRE.test(net.networkCode));
    });
    if (unrestricted.length == 0) {
      let errRestricted = new Error("No unrestricted networks");
      errRestricted.url = url;
      throw errRestricted;
    }
    let withStations = unrestricted.filter(function(net) {
             return ( typeof net.totalNumberStations === "undefined"
                || !net.totalNumberStations
                ||  net.totalNumberStations > 1);
    });
    if (withStations.length == 0) {
      let errNoSta = new Error("No networks with stations");
      errNoSta.url = url;
      throw errNoSta;
    }
    let i = Math.floor(Math.random()*withStations.length);
    let net = withStations[i];
    net.url = url;
    return net;
  }).catch(function(err) {
    if (! err.url) {err.url = url;}
    throw err;
  });
}

export function randomStation(dc, netCode, startTime) {
  let query = createQuery(dc, ST)
      .networkCode(netCode);
  if (startTime) {
    query.startTime(startTime);
  }
  let url = query.formURL(fdsnstation.LEVEL_STATION);
  return query.queryStations().then(function(networks) {
    if (networks.length == 0) {
      let err = new Error("No networks");
      err.url = url;
      throw err;
    }
    if (networks[0].stations.length == 0) {
      let errNoSta = new Error("No stations in network "+networks[0].networkCode);
      errNoSta.url = url;
      throw errNoSta;
    }
    // got some stations in first net
    let unrestricted = networks[0].stations.filter(function(net) {
      return ( ! net.restrictedStatus || net.restrictedStatus == "open");
    });
    if (unrestricted.length == 0) {
      let errRestricted = new Error("No unrestricted stations in "+networks[0].networkCode);
      errRestricted.url = url;
      throw errRestricted;
    }
    let i = Math.floor(Math.random()*unrestricted.length);
    let sta = unrestricted[i];
    sta.url = url;
    return sta;
  }).catch(function(err) {
    if (! err.url) {err.url = url;}
    throw err;
  });
}

export function dateStrEndsZ(s) {
  return s.charAt(s.length-1) === 'Z';
}
