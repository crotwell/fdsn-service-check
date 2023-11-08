import {
  fdsnavailability, fdsnevent, fdsnstation, fdsndataselect, luxon
} from 'seisplotjs';

export function githubTestURL(testid) {
  return 'https://github.com/crotwell/fdsn-service-check/blob/master/src/test' + testid + '.js';
}

export function findSupport(dc, type) {
  for (const repo of dc.repositories) {
    const out = repo.services.find(function(s) { return s.name === type; });
    if (out) { return out;}
  }
  return null;
}

export function doesSupport(dc, type) {
  for (const repo of dc.repositories) {
    const out = repo.services.find(function(s) { return s.name === type; });
    if (out) { return true;}
  }
  return false;
}

export function serviceHost(dc, type) {
  const service = findSupport(dc, type);
  if (service) {
    if ("url" in service && typeof service.url === 'string') {
      const url = new URL(service.url);
      return url.hostname;
    }
  }
  return null;
}

export function servicePort(dc, type) {
  const service = findSupport(dc, type);
  if (service) {
    if ("url" in service && typeof service.url === 'string') {
      const url = new URL(service.url);
      return url.port ? url.port : 80;
    }
  }
  return 80;
}

export function createQuery(dc, type) {
  let q = null;
  if (type === AV) {
    q = new fdsnavailability.AvailabilityQuery();
  } else if (type === DS) {
    q = new fdsndataselect.DataSelectQuery();
  } else if (type === EV) {
    q = new fdsnevent.EventQuery();
  } else if (type === ST) {
    q = new fdsnstation.StationQuery();
  } else {
    throw new Error('Unkown type: ' + type);
  }
  q.host(serviceHost(dc, type));
  const p = servicePort(dc, type);
  if (p && p !== 80) {
    q.port(p);
  }
  return q;
}

export const AV = 'fdsnws-availability-1';
export const DS = 'fdsnws-dataselect-1';
export const EV = 'fdsnws-event-1';
export const ST = 'fdsnws-station-1';

export function randomNetwork(dc, startTime) {
  const query = createQuery(dc, ST);
  if (startTime) {
    query.startTime(startTime);
  }
  // make sure some param is set, look for active networks
  query.startBefore(luxon.DateTime.utc());
  const url = query.formURL(fdsnstation.LEVEL_NETWORK);
  return query.queryNetworks().then(function(networks) {
    if (networks.length == 0) {
      const err = new Error('No networks');
      err.url = url;
      throw err;
    }
    // got some nets
    const permNetRE = /[A-W][A-Z0-9]/;
    const unrestricted = networks.filter(function(net) {
      return ((!net.restrictedStatus || net.restrictedStatus == 'open') &&
        permNetRE.test(net.networkCode));
    });
    if (unrestricted.length == 0) {
      const errRestricted = new Error('No unrestricted networks');
      errRestricted.url = url;
      throw errRestricted;
    }
    const withStations = unrestricted.filter(function(net) {
      return (typeof net.totalNumberStations === 'undefined' ||
        !net.totalNumberStations ||
        net.totalNumberStations > 1);
    });
    if (withStations.length == 0) {
      const errNoSta = new Error('No networks with stations');
      errNoSta.url = url;
      throw errNoSta;
    }
    const i = Math.floor(Math.random() * withStations.length);
    const net = withStations[i];
    net.url = url;
    return net;
  }).catch(function(err) {
    if (!err.url) { err.url = url; }
    throw err;
  });
}

export function randomStation(dc, netCode, startTime) {
  const query = createQuery(dc, ST)
    .networkCode(netCode);
  if (startTime) {
    query.startTime(startTime);
  }
  const url = query.formURL(fdsnstation.LEVEL_STATION);
  return query.queryStations().then(function(networks) {
    if (networks.length == 0) {
      const err = new Error('No networks');
      err.url = url;
      throw err;
    }
    if (networks[0].stations.length == 0) {
      const errNoSta = new Error('No stations in network ' + networks[0].networkCode);
      errNoSta.url = url;
      throw errNoSta;
    }
    // got some stations in first net
    const unrestricted = networks[0].stations.filter(function(net) {
      return (!net.restrictedStatus || net.restrictedStatus == 'open');
    });
    if (unrestricted.length == 0) {
      const errRestricted = new Error('No unrestricted stations in ' + networks[0].networkCode);
      errRestricted.url = url;
      throw errRestricted;
    }
    const i = Math.floor(Math.random() * unrestricted.length);
    const sta = unrestricted[i];
    sta.url = url;
    return sta;
  }).catch(function(err) {
    if (!err.url) { err.url = url; }
    throw err;
  });
}

export function dateStrEndsZ(s) {
  return s.charAt(s.length - 1) === 'Z';
}
