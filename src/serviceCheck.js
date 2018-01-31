

import {allFdsnTests} from './allServiceTests';
import * as seisplotjs from 'seisplotjs';
import {DS, EV, ST, serviceHost, doesSupport, githubTestURL } from './util';

// seisplotjs comes from the seisplotjs standalone bundle
let d3 = seisplotjs.d3;
let fdsnevent = seisplotjs.fdsnevent;
let fdsnstation = seisplotjs.fdsnstation;
let fdsndataselect = seisplotjs.fdsndataselect;
let RSVP = fdsnstation.RSVP;
let UNSUPPORTED = "Unsupported";
let dataCentersURL = "./fdsnDataCenters.json";

console.log("allFdsnTests: "+allFdsnTests);

let fdsnDataCenters = null;
// note does not work for localhost and/or file loading, must
// be from web server due to security I think
fetch(dataCentersURL)
  .then(function(response) {
    console.log("got response!");
    return response.json();
  })
  .then(function(jsonResponse) {
  fdsnDataCenters = jsonResponse;
  makeTable(fdsnDataCenters);
  makeTestsTable(allFdsnTests, fdsnDataCenters);
}).catch(function(error) {
  console.assert(false, error);
  console.log(error);
  makeErrorMessage(error);
});






// all tests should be object with testid, testname and test: function(datacenter, d3selector)
// allFdsnTests assumed to be global object with the tests in it, loaded from
// separate file. It should have 3 fields, each an array of tests like:
//
// allFdsnTests = {
//     fdsnEventTests = [ testEventVersion, testLastDay, testCatalogs, testContributors ],
//     fdsnStationTests = [ testStationVersion, testNetworks ],
//     fdsnDataTests = [ testDataSelectVersion ]
// }


function selectionForTestDC(test, dc) {
  let sel = d3.select("tr."+test.testid+"."+dc.id).select("td.testresult");
  if ( sel && ! sel.empty()) {
    return sel;
  } else {
    sel = d3.select("tr."+dc.id).select("td.testresult");
    return sel;
  }
}


function runTestOnDC(test, dc, DCType) {
  let testRunStart = performance.now();
  let sel = selectionForTestDC(test, dc);
console.log("RunTestOnDC: "+test.testname+" "+dc.id+" "+DCType+"  sup="+doesSupport(dc, DCType));
  if ( ! doesSupport(dc, DCType) ) {
    return new RSVP.Promise(function(resolve) {
      resolve( {
        text: UNSUPPORTED,
        url: "none"
      });
    }).then(function(out) {
      sel.selectAll("*").remove();
      sel.append("span")
          .attr("class", "unsupported")
          .text("no impl");
      return out;
    });
  }
  // dc type is supported
  return new RSVP.Promise(function(resolve) {
    resolve( {
        text: "",
        url: "none"
      });
  }).then(function() {
     // run test and package up result
console.log("run "+test.testname+" on "+dc.id+" "+DCType);
     return test.test(dc);
  }).then(function(result) {
         let out = {
           text: "ok",
           test: test,
           dc: dc,
           runtime: ( performance.now() - testRunStart ),
           output: "",
           result: result
         };
         if (result.text) {
           out.text = result.text;
         }
         if (result.url) {
           out.url = result.url;
         }
         if (result.output) {
           out.output = result.output;
         }
         return out;
  }).then(function(testOut) {
      sel.selectAll("*").remove();
      sel.append("a")
          .attr("class", "success")
          .attr("href", testOut.url)
          .text("OK");
      let messageSel = d3.select("tr."+test.testid+"."+dc.id).select("td.testmessage");
      messageSel.selectAll("*").remove();
      messageSel.append("span").text(testOut.text);
      let runtimeSel = d3.select("tr."+test.testid+"."+dc.id).select("td.runtime");
      runtimeSel.selectAll("*").remove();
      runtimeSel.append("span").text(Math.round(testOut.runtime)/1000);
      return testOut;
  }).catch(function(err) {
      let runtime = ( performance.now() - testRunStart );
      let runtimeSel = d3.select("tr."+test.testid+"."+dc.id).select("td.runtime");
      runtimeSel.selectAll("*").remove();
      runtimeSel.append("span").text(Math.round(runtime)/1000);
      let messageSel = d3.select("tr."+test.testid+"."+dc.id).select("td.testmessage");
console.log("catch in test='"+test.testname+"' on "+dc.id+" "+DCType);
console.assert(false, err);
if (err.url) {
console.log("   url: "+err.url);
}
      let failClass = 'fail';
      if (test.severity === 'opinion') {
        failClass = 'failOpinion';
      }
      sel.selectAll("*").remove();
      messageSel.selectAll("*").remove();
      if (err === UNSUPPORTED) {
         console.log("test "+test.testname+" on "+dc.id+" "+DCType+" unsupported.");
         sel.append("span").text("unsupported");
      } else {
        console.assert(false, err);
        let popupText = "";
        if (err.message) {popupText += err.message;}
        if (typeof err.status != 'undefined') {
          popupText += " status="+err.status;
          if (err.status === 0) {
            popupText += ", maybe CORS issue?";
          }
        }
        if (err.statusText) {
          popupText += " "+ err.statusText;
        }
        if (err.url) {
          sel.append("a").attr("class", failClass).attr("href", err.url).text("Oops").attr("title", popupText);
        } else {
console.log("error with no URL", err);
          sel.append("span").attr("class", failClass).attr("title", popupText).text("Oops");
        }
        messageSel.append("span").text(popupText);
      }
      //return err;
  });
}

function makeTable(fdsn) {
  let div = d3.select(".datacenters");
  if ( ! div ) { return; }
  div.select("p").remove();
  let table = div.select("table");
  if ( table.empty()) {
    table = d3.select(".datacenters").append("table");
    let thr = table.append("thead").append("tr");
    thr.append("th").text("Name");
    thr.append("th").text("Event");
    thr.append("th").text("Station");
    thr.append("th").text("DataSelect");
    thr.append("th").text("Run Tests");
    table.append("tbody");
  }
  let tableData = table.select("tbody")
    .selectAll("tr")
    .data(fdsn.datacenters);
  tableData.exit().remove();

  let tr = tableData.enter().append("tr").attr("class", function(dc) {return dc.id;});

  tr.append("td")
    .append("a").attr("href", function(d) {
      if (d.website) {
        return d.website;
      } else {
        return "http://"+d.host;
      }
    }).html(function(d) {
      return d.name;
    });
    tr.append("td")
      .append(function(d) {
        if ( doesSupport(d, EV)) {
          let aElement = document.createElement("a");
          d3.select(aElement)
            .attr("href", new fdsnevent.EventQuery()
                .host(serviceHost(d, EV))
                .formBaseURL())
            .text( "Yes" );
          return aElement;
        } else {
          let spanElement = document.createElement("span");
          d3.select(spanElement)
            .text( "No");
          return spanElement;
        }
      });
    tr.append("td")
      .append(function(d) {
        if ( doesSupport(d, ST)) {
          let aElement = document.createElement("a");
          d3.select(aElement)
            .attr("href", new fdsnstation.StationQuery()
                .host(serviceHost(d, ST))
                .formBaseURL())
            .text( "Yes" );
          return aElement;
        } else {
          let spanElement = document.createElement("span");
          d3.select(spanElement)
            .text( "No");
          return spanElement;
        }
    });
  tr.append("td")
      .append(function(d) {
        if ( doesSupport(d, DS)) {
          let aElement = document.createElement("a");
          d3.select(aElement)
            .attr("href", new fdsndataselect.DataSelectQuery()
                .host(serviceHost(d, DS))
                .formBaseURL())
            .text( "Yes" );
          return aElement;
        } else {
          let spanElement = document.createElement("span");
          d3.select(spanElement)
            .text( "No");
          return spanElement;
        }
    });
  tr.append("td")
    .append("button")
    .text("Run")
    .on("click", function(d) {
      runAllTests(fdsn, d.id);
    });
}

function makeTestsTable(inTests, fdsn) {
console.log("makeTestsTable: fdsn"+fdsn.datacenters.length);
  let div = d3.select("div.testlist");
  if ( ! div) { return; }
  div.selectAll("*").remove();
  let divP = div.append("h3");
  divP.text("Tests");
  let table = div.select("table");
  if ( table.empty()) {
    table = d3.select(".testlist").append("table");
    let thr = table.append("thead").append("tr");
    thr.append("th").text("Test Name");
    thr.append("th").text("Run");
    thr.append("th").text("Service");
    thr.append("th").text("Test Code");
    thr.append("th").text("Detail");
    table.append("tbody");
  }

  let allTests = inTests.fdsnEventTests.concat(inTests.fdsnStationTests).concat(inTests.fdsnDataTests);

  let tableData = table.select("tbody")
    .selectAll("tr")
    .data(allTests);
  tableData.exit().remove();
  let tr = tableData.enter().append("tr").attr("class", function(test) {return test.testid;});
  tr.append("td")
    .text(function(test) {
       return test.testname;
  });
  tr.append("td")
    .append("button")
    .text("Run")
    .on("click", function(d) {
      runOneTest(d.testid, fdsn);
    });
  tr.append("td").append("span").text(function(test) {
       return test.webservices.join(" ");
  });
  tr.append("td")
    .append("a").attr("href", function(test) {return githubTestURL(test.testid);})
    .text("source");
  tr.append("td").append("span").text(function(test) {
       return test.description;
  });
}

function makeErrorMessage(errorMsg) {
  let div = d3.select("div.results");
  div.selectAll("*").remove();
  let divH3 = div.append("h3");
  divH3.text("Error");
  let divP = div.append("p");
  divP.text(errorMsg);
}

function makeResultsTable(dc, inTests) {
  let div = d3.select("div.results");
  div.selectAll("*").remove();
  let divP = div.append("h3");
  divP.text("Results for ");
  divP.append("a").attr("href", dc.url).text(dc.name);
  let table = div.select("table");
  if ( table.empty()) {
    table = d3.select(".results").append("table");
    let thr = table.append("thead").append("tr");
    thr.append("th").text("Result");
    thr.append("th").text("Test Name");
    thr.append("th").text("Service");
    thr.append("th").text("Detail");
    thr.append("th").text("Output");
    thr.append("th").text("Runtime (s)");
    table.append("tbody");
  }

  let allTests = inTests.fdsnEventTests.concat(inTests.fdsnStationTests).concat(inTests.fdsnDataTests);

  allTests = allTests.filter(function(test) {
    return test.webservices.reduce(function(acc, wsType) {
      return acc && doesSupport(dc, wsType);
    }, true);
  });

  let tableData = table.select("tbody")
    .selectAll("tr")
    .data(allTests);
  tableData.exit().remove();
  let tr = tableData.enter().append("tr").attr("class", function(test) {return test.testid+" "+dc.id;});
  tr.append("td").attr("class", "testresult");
  tr.append("td")
    .append("a").attr("href", function(test) {return githubTestURL(test.testid);})
    .text(function(test) {
       return test.testname;
  });
  tr.append("td").append("span").text(function(test) {
       return test.webservices.join(" ");
  });
  tr.append("td").append("span").text(function(test) {
       return test.description;
  });
  tr.append("td").attr("class", "testmessage");
  tr.append("td").attr("class", "runtime");
}


function makeResultsOneTestTable(test, fdsn) {
console.log("makeResultsOneTestTable fdsnDCs: "+fdsn.datacenters.length);
  let div = d3.select("div.results");
  div.selectAll("*").remove();
  let divP = div.append("h3");
  divP.text("Results for ");
  divP.append("a").attr("href", githubTestURL(test.testid)).text(test.testname);
  let table = div.select("table");
  if ( table.empty()) {
    table = d3.select(".results").append("table");
    let thr = table.append("thead").append("tr");
    thr.append("th").text("Result");
    thr.append("th").text("Name");
    thr.append("th").text("Service");
    thr.append("th").text("Output");
    thr.append("th").text("Runtime (s)");
    table.append("tbody");
  }

  let tableData = table.select("tbody")
    .selectAll("tr")
    .data(fdsn.datacenters);
  tableData.exit().remove();
  let tr = tableData.enter().append("tr").attr("class", function(dc) {return test.testid+" "+dc.id;});
  tr.append("td").attr("class", "testresult");
  tr.append("td")
    .append("a").attr("href", function(dc) {
      if (dc.website) {
        return dc.website;
      } else {
        return "http://"+dc.host;
      }
    }).html(function(dc) {
      return dc.name;
    });
  tr.append("td").append("span").text(function(dc) {
       return serviceHost(dc, test.webservices[0]);
  });
  tr.append("td").attr("class", "testmessage");
  tr.append("td").attr("class", "runtime");
}

function runAllTests(fdsn, dcid) {
// loop dc and tests...
  let dc = fdsn.datacenters.find(function(dc) {
    return dc.id === dcid;
  });
  makeResultsTable(dc, allFdsnTests);
  let dcTests = fdsn.datacenters
    .filter(function(dc) {
      return dc.id === dcid;
    }).map(function(dc) {
    let combinedTests = { dc: dc };
    let initEVTest = new RSVP.Promise(function(resolve) {
       resolve(true);
    });
    let initSTTest = new RSVP.Promise(function(resolve) {
       resolve(true);
    });
    let initDSTest = new RSVP.Promise(function(resolve) {
       resolve(true);
    });

    if (doesSupport(dc, EV)) {
      combinedTests.fdsnevent = allFdsnTests.fdsnEventTests.reduce(function(acc, test) {
        return acc.then(function(prevResult) {
          if (prevResult) {
            let sel = selectionForTestDC(test, dc);
            sel.append("span").text("Run");
            return runTestOnDC(test, dc, EV);
          } else {
            return false;
          }
        });
      }, initEVTest);
    }
    if (doesSupport(dc, ST)) {
       combinedTests.fdsnstation = allFdsnTests.fdsnStationTests.reduce(function(acc, test) {
        return acc.then(function(prevResult) {
          if (prevResult) {
            let sel = selectionForTestDC(test, dc);
            sel.append("span").text("Run");
            return runTestOnDC(test, dc, ST);
          } else {
            return false;
          }
        });
      }, initSTTest);
    }
    if (doesSupport(dc, DS)) {
      combinedTests.fdsndataselect = allFdsnTests.fdsnDataTests.reduce(function(acc, test) {
        return acc.then(function(prevResult) {
          if (prevResult) {
            let sel = selectionForTestDC(test, dc);
            sel.append("span").text("Run");
            return runTestOnDC(test, dc, DS);
          } else {
            return false;
          }
        });
      }, initDSTest);
    }
    return combinedTests;
  });

  RSVP.all(dcTests.map(function(dcT) { return RSVP.hash(dcT);}))
  .then(function() {console.log("tests finished"); })
  .catch(function(r) {
    console.assert(false, r);
    console.log("oops, something didn't finish");
  });

}


function runOneTest(testid, fdsn) {
console.log("allFdsnTests: "+allFdsnTests);
console.log("fdsn dcs: "+fdsn.datacenters.length);
// loop dc and tests...
  let test = allFdsnTests.all.find(function(d) {
    return d.testid === testid;
  });
  makeResultsOneTestTable(test, fdsn);
  let dcTests = fdsn.datacenters.map(function(dc) {
    let sel = d3.select("tr."+dc.id).select("td.testresult");
    sel.append("span").text("Run");
// wrong if test in on multiple server types
    return runTestOnDC(test, dc, test.webservices[0]);
  });
  return RSVP.allSettled(dcTests)
    .then(function(settled) {
      console.log("runOneTest settled: "+settled.length+" "+settled[0]);
    });
}
