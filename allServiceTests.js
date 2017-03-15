
console.log("in allServiceTests.js");
var allFdsnTests = function() {


// seisplotjs comes from the seisplotjs standalone bundle
var d3 = seisplotjs.d3;
var wp = seisplotjs.waveformplot;
var traveltime = seisplotjs.traveltime;
var fdsnevent = seisplotjs.fdsnevent;
var fdsnstation = seisplotjs.fdsnstation;
var fdsndataselect = seisplotjs.fdsndataselect;
var RSVP = fdsnstation.RSVP;


var DS = "fdsnws-dataselect";
var EV = "fdsn-event";
var ST = "fdsn-station";



// all tests should be object with testid, testname and test: function(datacenter, d3selector)

var testEventVersion = {
  testname: "Event Version",
  testid: "eventversion",
  description: "Queries the version of the service, success as long as the query returns something",
  webservices: [ EV ],
  test: function(dc) {
    var host = serviceHost(dc, EV);

    var quakeQuery = new fdsnevent.EventQuery()
      .host(host);
    var url = quakeQuery.formVersionURL();
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


var testStationVersion = {
  testname: "Station Version",
  testid: "stationversion",
  description: "Queries the version of the service, success as long as the query returns something",
  webservices: [ ST ],
  test: function(dc) {
    var host = serviceHost(dc, ST);

    var query = new fdsnstation.StationQuery()
      .host(host);
    var url = query.formVersionURL();
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

var testDataSelectVersion = {
  testname: "DataSelect Version",
  testid: "dataselectversion",
  description: "Queries the version of the service, success as long as the query returns something",
  webservices: [ DS ],
  test: function(dc) {
    var host = serviceHost(dc, ST);

    var query = new fdsndataselect.DataSelectQuery()
      .host(host);
    var url = query.formVersionURL();
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

var testNoDataEvent = {
  testname: "NoData Event",
  testid: "nodataevent",
  description: "Queries for events that should be valid but return no data. Success if anything is returned, even empty result. This can be a check on the CORS header.",
  webservices: [ EV ],
  test: function(dc) {
    return new RSVP.Promise(function(resolve, reject) {
    if ( ! doesSupport(dc, EV) ) {
      reject(new Error(EV+" Unsupported by "+dc.id));
    } else {
      resolve(null);
    }
   }).then(function(val) {
    var daysAgo = 1;
    var host = serviceHost(dc, EV);
    var quakeQuery = new fdsnevent.EventQuery()
      .host(host)
      .startTime(new Date(new Date().getTime()-86400*daysAgo*1000))
      .endTime(new Date())
      .minMag(99);
    var url = quakeQuery.formURL();
    return quakeQuery.query().then(function(quakes) {
      if (quakes.length > 0) {
        throw new Error("Should be no data, but "+quakes.length+" events.");
      } else {
        return {
          text: "Found "+quakes.length,
          url: url,
          output: quakes
        };
      }
    }).catch(function(err) {
      if (! err.url) {err.url = url;}
      throw err;
    });
    });
  }
};

var testLastDay = {
  testname: "Last Day",
  testid: "lastday",
  description: "Queries for events in the past 24 hours",
  webservices: [ EV ],
  test: function(dc) {
    return new RSVP.Promise(function(resolve, reject) {
    if ( ! doesSupport(dc, EV) ) {
      reject(new Error("Unsupported"));
    } else {
      resolve(null);
    }
   }).then(function(val) { 
    var daysAgo = 1;
    var host = serviceHost(dc, EV);
    var quakeQuery = new fdsnevent.EventQuery()
      .host(host)
      .startTime(new Date(new Date().getTime()-86400*daysAgo*1000))
      .endTime(new Date());
    var url = quakeQuery.formURL();
    return quakeQuery.query().then(function(quakes) {
      return {
        text: "Found "+quakes.length,
        url: url,
        output: quakes
      };
    }).catch(function(err) {
      if (! err.url) {err.url = url;}
      throw err;
    });
    });
  }
};



var testEventFromPublicID = {
  testname: "eventid=publicID",
  testid: "eventid_publicid",
  description: "Queries events in the past 24 hours, then tries to make an eventid= query for the first event using its entire publicID with no modification. This allows a client to do a general then specific query style.",
  webservices: [ EV ],
  test: function(dc) {
    return new RSVP.Promise(function(resolve, reject) {
      if ( ! doesSupport(dc, EV) ) {
        reject(new Error("Unsupported"));
      } else {
        resolve(null);
      }
   }).then(function(val) {
    var daysAgo = .5;
    var host = serviceHost(dc, EV);
    var quakeQuery = new fdsnevent.EventQuery()
      .host(host)
      .startTime(new Date(new Date().getTime()-86400*daysAgo*1000))
      .endTime(new Date());
    var url = quakeQuery.formURL();
    return quakeQuery.query().then(function(quakes) {
        if (quakes.length == 0) {
          throw new Error("No quakes returned");
        }
        var singleQuakeQuery = new fdsnevent.EventQuery()
          .host(host)
          .eventid(encodeURIComponent(quakes[0].publicID));
        url = singleQuakeQuery.formURL();
        return singleQuakeQuery.query();
      }).then(function(singleQuake) {
      return {
        text: "Found "+singleQuake.time(),
        url: url,
        output: singleQuake
      };
    }).catch(function(err) {
      if (! err.url) {err.url = url;}
      throw err;
    });
    });
  }
};

var testEventFromBestGuessEventId = {
  testname: "Best Guess EventId",
  testid: "guesseventid",
  description: "Queries events in the past 24 hours, then tries to make an eventid= query for the first event using a huristic to determine the eventid. This allows a client to do a general then specific query style, but with more effort than eventid=publicID as the client must guess the value for eventid in the specific query. This is also fragile as the huristic must be updated for each new server.",
  webservices: [ EV ],
  test: function(dc) {
    return new RSVP.Promise(function(resolve, reject) {
      if ( ! doesSupport(dc, EV) ) {
        reject(new Error("Unsupported"));
      } else {
        resolve(null);
      }
   }).then(function(val) {
    var daysAgo = .5;
    var host = serviceHost(dc, EV);
    var quakeQuery = new fdsnevent.EventQuery()
      .host(host)
      .startTime(new Date(new Date().getTime()-86400*daysAgo*1000))
      .endTime(new Date());
    var url = quakeQuery.formURL();
    return quakeQuery.query().then(function(quakes) {
        if (quakes.length == 0) {
          throw new Error("No quakes returned");
        }
        var singleQuakeQuery = new fdsnevent.EventQuery()
          .host(host)
          .eventid(encodeURIComponent(quakes[0].eventid));
        return singleQuakeQuery.query();
      }).then(function(quakes) {
      return {
        text: "Found "+quakes.length,
        url: url,
        output: quakes
      };
    }).catch(function(err) {
      if (! err.url) {err.url = url;}
      throw err;
    });
    });
  }
};

var testCatalogs = {
  testname: "Catalogs",
  testid: "catalogs",
  description: "Queries the list of catalogs of the event service, success as long as the query returns something",
  webservices: [ EV ],
  test: function(dc) {
    return new RSVP.Promise(function(resolve, reject) {
    if ( ! doesSupport(dc, EV) ) {
      reject(new Error("Unsupported"));
    } else {
      resolve(null);
    }
   }).then(function(val) {
    var host = serviceHost(dc, EV);
    var quakeQuery = new fdsnevent.EventQuery()
      .host(host);
    var url = quakeQuery.formCatalogsURL();
    return quakeQuery.queryCatalogs().then(function(catalogs) {
      return {
        text: "Found "+catalogs.length,
        url: url,
        output: catalogs
      };
    }).catch(function(err) {
      if (! err.url) {err.url = url;}
      throw err;
    });
    });
  }
};

var testContributors = {
  testname: "Contributors",
  testid: "contributors",
  description: "Queries the list of contributors of the event service, success as long as the query returns something",
  webservices: [ EV ],
  test: function(dc) {
    return new RSVP.Promise(function(resolve, reject) {
    if ( ! doesSupport(dc, EV) ) {
      reject(new Error("Unsupported"));
    } else {
      resolve(null);
    }
   }).then(function(val) {
    var host = serviceHost(dc, EV);
    var quakeQuery = new fdsnevent.EventQuery()
      .host(host);
    var url = quakeQuery.formContributorsURL();
    return quakeQuery.queryContributors().then(function(contributors) {
      return {
        text: "Found "+contributors.length,
        url: url,
        output: contributors
      };
    }).catch(function(err) {
      if (! err.url) {err.url = url;}
      throw err;
    });
    });
  }
};

var testNoDataNetwork = {
  testname: "NoData Networks",
  testid: "nodatanetworks",
  description: "Queries for networks that should be well formed but return no networks, success as long as the query returns something, even an empty result. This can be a check on the CORS header.",
  webservices: [ ST ],
  test: function(dc) {
    return new RSVP.Promise(function(resolve, reject) {
    if ( ! doesSupport(dc, ST) ) {
      reject(new Error("Unsupported"));
    } else {
      resolve(null);
    }
   }).then(function(val) {
    var mythis = this;
    var host = serviceHost(dc, ST);
  
    var query = new fdsnstation.StationQuery()
      .host(host)
      .networkCode("xx");
    var url = query.formURL(fdsnstation.LEVEL_NETWORK);
    return query.queryNetworks().then(function(networks) {
      if (networks.length > 0) {
        throw new Error("Should be no data, but "+networks.length+" networks.");
      } else {
        return {
          text: "Found "+networks.length,
          url: url,
          output: networks
        };
      }
    }).catch(function(err) {
      if (! err.url) {err.url = url;}
      throw err;
    });
    });
  }
};

var testNetworks = {
  testname: "Networks",
  testid: "networks",
  description: "Queries for all networks, success as long as the query returns something, even an empty result.",
  webservices: [ ST ],
  test: function(dc) {
    return new RSVP.Promise(function(resolve, reject) {
    if ( ! doesSupport(dc, ST) ) {
      reject(new Error("Unsupported"));
    } else {
      resolve(null);
    }
   }).then(function(val) { 
    var mythis = this;
    var host = serviceHost(dc, ST);
   
    var query = new fdsnstation.StationQuery()
      .host(host);
    var sel =d3.select("tr."+dc.id).select("td."+mythis.testid);
    var url = query.formURL(fdsnstation.LEVEL_NETWORK);
    return query.queryNetworks().then(function(networks) {
      return {
        text: "Found "+networks.length,
        url: url,
        output: networks
      };
    }).catch(function(err) {
      if (! err.url) {err.url = url;}
      throw err;
    });
    });
  }
};

function randomNetwork(dc, startTime) {
  var host = serviceHost(dc, ST);
  var query = new fdsnstation.StationQuery()
      .host(host);
  if (startTime) {
    query.startTime(startTime);
  }
  return query.queryNetworks().then(function(networks) {
    var url = query.formURL(fdsnstation.LEVEL_NETWORK);
    if (networks.lengh == 0) {
      var err = new Error("No networks");
      err.url = url;
      throw err;
    }
    // got some nets
    var unrestricted = networks.filter(function(net) {
      return  ( ! net.restrictedStatus()) || net.restrictedStatus() == "open";
    });
    if (unrestricted.length == 0) {
      var err = new Error("No unrestricted networks");
      err.url = url;
      throw err;
    }
    var i = Math.floor(Math.random()*unrestricted.length);
    var net = unrestricted[i];
    net.url = url;
    return net;
  });
}


function randomStation(dc, netCode, startTime) {
  var host = serviceHost(dc, ST);
  var query = new fdsnstation.StationQuery()
      .host(host)
      .networkCode(netCode);
  if (startTime) {
    query.startTime(startTime);
  }
  return query.queryStations().then(function(networks) {
    var url = query.formURL(fdsnstation.LEVEL_STATION);
    if (networks.length == 0) {
      var err = new Error("No networks");
      err.url = url;
      throw err;
    }
    if (networks[0].stations().length == 0) {
      var err = new Error("No stations in network "+networks[0].networkCode());
      err.url = url;
      throw err;
    }
    // got some stations in first net
    var unrestricted = networks[0].stations().filter(function(net) {
      return ( ! net.restrictedStatus()) || net.restrictedStatus() == "open";
    });
    if (unrestricted.length == 0) {
      var err = new Error("No unrestricted stations in "+networks[0].networkCode());
      err.url = url;
      throw err;
    }
    var i = Math.floor(Math.random()*unrestricted.length);
    var sta = unrestricted[i];
    sta.url = url;
    return sta;
  });
}



var testStations = {
  testname: "Stations",
  testid: "stations",
  description: "Queries for stations within a random unrestricted network returned from all networks, success as long as the query returns something, even an empty result.",
  webservices: [ ST ],
  test: function(dc) {
    return new RSVP.Promise(function(resolve, reject) {
      if ( ! doesSupport(dc, ST) ) {
        reject(new Error("Unsupported"));
      } else {
        resolve(null);
      }
    }).then(function(val) {
      var mythis = this;
      var host = serviceHost(dc, ST);
      return randomNetwork(dc);
    }).then(function(net) {
      return randomStation(dc, net.networkCode());
    }).then(function(sta) {
      return {
        text: "Found "+sta.stationCode(),
        url: sta.url,
        output: sta
      };
    });
  }
};

var testChannels = {
  testname: "Channels",
  testid: "channels",
  description: "Queries for channels from a random unrestricted station within a random network returned from all networks, success as long as the query returns something, even an empty result.",
  webservices: [ ST ],
  test: function(dc) {
    return new RSVP.Promise(function(resolve, reject) {
      if ( ! doesSupport(dc, ST) ) {
        reject(new Error("Unsupported"));
      } else {
        resolve(null);
      }
    }).then(function(val) {
      var mythis = this;
      var host = serviceHost(dc, ST);
      return randomNetwork(dc);
    }).then(function(net) {
      return randomStation(dc, net.networkCode());
    }).then(function(sta) {
      var chanQuery = new fdsnstation.StationQuery()
        .host(serviceHost(dc, ST))
        .networkCode(sta.network().networkCode())
        .stationCode(sta.stationCode());
      return chanQuery.queryChannels()
        .then(function(channels) {
          channels.url = chanQuery.formURL(fdsnstation.LEVEL_CHANNEL);
          return channels;
        });
    }).then(function(channels) {
      return {
        text: "Found "+channels.length,
        url: channels.url,
        output: channels
      };
    });
  }
};

var testDataSelectNoData = {
  testname: "No Data",
  testid: "dsnodata",
  description: "Attempts to make a dataselect query that should be correctly formed but should not return data. Success as long as the query returns, even with an empty result. This can be a check on the CORS header.",
  webservices: [ ST, DS ],
  test: function(dc) {
    return new RSVP.Promise(function(resolve, reject) {
    if ( ! doesSupport(dc, DS) || ! doesSupport(dc, ST) ) {
      reject(new Error("Unsupported"));
    } else {
      resolve(null);
    }
   }).then(function() {
    var host = serviceHost(dc, DS);

    var query = new fdsndataselect.DataSelectQuery()
      .host(host);
    var url = query
      .networkCode("XX")
      .stationCode("ABC")
      .locationCode("99")
      .channelCode("XXX")
      .computeStartEnd(new Date(Date.UTC(1980,1,1,0,0,0)), null, 300, 0)
      .formURL();
    return query.query().then(function(miniseed) {
      if (miniseed.length > 0) {
        throw new Error("Should be no data, but "+miniseed.length+" miniseed records.");
      } else {
        return {
          text: "Found "+miniseed.length,
          url: url,
          output: miniseed
        };
      }
    }).catch(function(err) {
      if (! err.url) {err.url = url;}
      throw err;
    });
    });
  }
};

var testDataSelectRecent = {
  testname: "Recent Data",
  testid: "recentData",
  description: "Attempts to make a dataselect query by first querying for networks, then stations within the a random network and then using a random station to request the last 300 seconds for a BHZ channel. Success as long as the query returns, even with an empty result.",
  webservices: [ ST, DS ],
  test: function(dc) {
    return new RSVP.Promise(function(resolve, reject) {
    if ( ! doesSupport(dc, DS) || ! doesSupport(dc, ST) ) {
      reject(new Error("Unsupported"));
    } else {
      resolve(null);
    }
   }).then(function(val) {
    return randomNetwork(dc, new Date());
   }).then(function(net) {
     return randomStation(dc, net.networkCode(), new Date());
   }).then(function(station) {
    var host = serviceHost(dc, DS);

    var query = new fdsndataselect.DataSelectQuery()
      .host(host);
    var url = query
      .networkCode(station.network().networkCode())
      .stationCode(station.stationCode())
      .channelCode("SHZ,BHZ")
      .computeStartEnd(null, new Date(), 300, 0)
      .formURL();
    return query.query().then(function(miniseed) {
      return {
        text: "Found "+miniseed.length,
        url: url,
        output: miniseed
      };
    }).catch(function(err) {
      if (! err.url) {err.url = url;}
      throw err;
    });
    });
  }
};
// end test defs


function doesSupport(dc, type) {
var dcws = dc.supports.map(function(d) { return d.type; }).join(',');
  var out = dc.supports.find(function(s) { return s.type === type;});
//  if (! out) {
//    console.log("not doesSupport "+dc.id+" "+dcws+" "+type+" undef");
//  }
  return typeof out != 'undefined';
}

function serviceHost(dc, type) {
  var does = doesSupport(dc, type);
  if (does) {
    return does.host ? does.host : dc.host;
  }
  return null;
}

var tests = {
     fdsnEventTests: [ testEventVersion, testNoDataEvent, testLastDay, testCatalogs, testContributors, testEventFromBestGuessEventId, testEventFromPublicID ],
     fdsnStationTests: [ testStationVersion, testNoDataNetwork, testNetworks, testStations, testChannels ],
     fdsnDataTests: [ testDataSelectVersion, testDataSelectNoData, testDataSelectRecent ]
 };

var notVersionTest = {
     fdsnEventTests: tests.fdsnEventTests.filter(function(d) {
         return d.testid.indexOf("version") === -1;
     }),
     fdsnStationTests: tests.fdsnStationTests.filter(function(d) {
         return d.testid.indexOf("version") === -1;
     }),
     fdsnDataTests: tests.fdsnDataTests.filter(function(d) {
         return d.testid.indexOf("version") === -1;
     })
 };
var justOneTest = {
     fdsnEventTests: [ ],
     fdsnStationTests: [ ],
     fdsnDataTests: [ testDataSelectRecent]
};
var justVersionTest = {
     fdsnEventTests: [ testEventVersion ],
     fdsnStationTests: [ testStationVersion ],
     fdsnDataTests: [ testDataSelectVersion ]
};

var out = notVersionTest;
//var out = justVersionTest;
//var out = justOneTest;
//var out = tests;
// util functions
out.serviceHost = serviceHost;
out.doesSupport = doesSupport;
return out;
}();
