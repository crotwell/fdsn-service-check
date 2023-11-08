
import { allFdsnTests } from './allServiceTests';

import {
  fdsndatacenters,
  fdsnavailability,
  fdsnevent,
  fdsnstation,
  fdsndataselect,
  luxon
} from 'seisplotjs';
import * as seisplotjs from 'seisplotjs';
import * as d3 from 'd3-selection';
import { AV, DS, EV, ST, serviceHost, createQuery, doesSupport, githubTestURL } from './util';

const UNSUPPORTED = 'Unsupported';
const dataCentersURL = './fdsnDataCenters.json';

const STOP_AT_FIRST_FAIL = false;
const MIN_TEST_INTERVAL = 1000;

console.log('allFdsnTests: ' + allFdsnTests);

let fdsnDataCenters = null;



new fdsndatacenters.DataCentersQuery().queryJson()
  .then(function (jsonResponse) {
    fdsnDataCenters = jsonResponse;
    makeTable(fdsnDataCenters);
    makeTestsTable(allFdsnTests, fdsnDataCenters);
  }).catch(function (error) {
    console.assert(false, error);
    console.log(error);
    console.log('fetch fdsn datacenters does not work for localhost and/or file loading, must be from web server due to security I think');
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

function selectionForTestDC (test, dc) {
  let sel = d3.select(`tr.${test.testid}.${dc.name}`).select('td.testresult');
  if (sel && !sel.empty()) {
    return sel;
  } else {
    sel = d3.select('tr.' + dc.name).select('td.testresult');
    return sel;
  }
}

async function runTestOnDC (test, dc, DCType) {
  const testRunStart = performance.now();
  const sel = selectionForTestDC(test, dc);
  console.log('RunTestOnDC: ' + test.testname + ' ' + dc.name + ' ' + DCType + '  sup=' + doesSupport(dc, DCType));
  if (!doesSupport(dc, DCType)) {
    return new Promise(function (resolve) {
      resolve({
        text: UNSUPPORTED,
        url: 'none'
      });
    }).then(function (out) {
      sel.selectAll('*').remove();
      sel.append('span')
        .attr('class', 'unsupported')
        .text('unsup.');
      return out;
    });
  }
  // dc type is supported
  return new Promise(function (resolve) {
    resolve({
      text: '',
      url: 'none'
    });
  }).then(function () {
    // run test and package up result
    console.log('run ' + test.testname + ' on ' + dc.name + ' ' + DCType);
    return test.test(dc);
  }).then(function (result) {
    const out = {
      text: 'ok',
      test: test,
      dc: dc,
      runtime: (performance.now() - testRunStart),
      output: '',
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
  }).then(function (testOut) {
    sel.selectAll('*').remove();
    sel.append('a')
      .attr('class', 'success')
      .attr('href', testOut.url)
      .text('OK');
    const messageSel = d3.select('tr.' + test.testid + '.' + dc.name).select('td.testmessage');
    messageSel.selectAll('*').remove();
    messageSel.append('span').text(testOut.text);
    const runtimeSel = d3.select('tr.' + test.testid + '.' + dc.name).select('td.runtime');
    runtimeSel.selectAll('*').remove();
    runtimeSel.append('span').text(Math.round(testOut.runtime) / 1000);
    return testOut;
  }).then(function (testOut) {
    if (testOut.runtime < MIN_TEST_INTERVAL) {
      return sleep(MIN_TEST_INTERVAL - testOut.runtime, testOut);
    }
    return testOut;
  }).catch(function (err) {
    const runtime = (performance.now() - testRunStart);
    const runtimeSel = d3.select('tr.' + test.testid + '.' + dc.name).select('td.runtime');
    runtimeSel.selectAll('*').remove();
    runtimeSel.append('span').text(Math.round(runtime) / 1000);
    const messageSel = d3.select('tr.' + test.testid + '.' + dc.name).select('td.testmessage');
    console.log("catch in test='" + test.testname + "' on " + dc.name + ' ' + DCType);
    console.assert(false, err);
    if (err.url) {
      console.log('   url: ' + err.url);
    }
    let failClass = 'fail';
    if (test.severity === 'opinion') {
      failClass = 'failOpinion';
    }
    sel.selectAll('*').remove();
    messageSel.selectAll('*').remove();
    if (err === UNSUPPORTED) {
      console.log('test ' + test.testname + ' on ' + dc.name + ' ' + DCType + ' unsupported.');
      sel.append('span').text('unsupported');
    } else {
      console.assert(false, err);
      let popupText = '';
      if (err.message) { popupText += err.message; }
      if (typeof err.status !== 'undefined') {
        popupText += ' status=' + err.status;
        if (err.status === 0) {
          popupText += ', maybe CORS issue?';
        }
      }
      if (err.statusText) {
        popupText += ' ' + err.statusText;
      }
      if (err.url) {
        sel.append('a').attr('class', failClass).attr('href', err.url).text('Oops').attr('title', popupText);
      } else {
        sel.append('span').attr('class', failClass).attr('title', popupText).text('Oops');
      }
      messageSel.append('span').text(popupText);
    }
    if (runtime < MIN_TEST_INTERVAL) {
      return sleep(MIN_TEST_INTERVAL - runtime);
    }
    // return err;
  });
}

async function sleep (millis, value) {
  const before = performance.now();
  await new Promise(resolve => setTimeout(resolve(value), millis));
  const after = performance.now();
  console.log('try to sleep for ' + millis + ', sleep was ' + (after - before));
}

function makeTable (fdsn) {
  const div = d3.select('.datacenters');
  if (!div) { return; }
  div.select('p').remove();
  let table = div.select('table');
  if (table.empty()) {
    table = d3.select('.datacenters').append('table');
    const thr = table.append('thead').append('tr');
    thr.append('th').text('Name');
    thr.append('th')

      .append('a')
      .attr('href', 'https://www.fdsn.org/datacenters/')
      .attr('target', '_blank')
      .text('FDSN Registry');
    thr.append('th').text('Availability');
    thr.append('th').text('Event');
    thr.append('th').text('Station');
    thr.append('th').text('DataSelect');
    thr.append('th').text('Run Tests');
    table.append('tbody');
  }
  const tableData = table.select('tbody')
    .selectAll('tr')
    .data(fdsn.datacenters);
  tableData.exit().remove();

  const tr = tableData.enter().append('tr').attr('class', function (dc) { return dc.name; });

  tr.append('td')
    .append('a').attr('href', function (d) {
      if (d.website) {
        return d.website;
      } else {
        return 'http://' + serviceHost(d);
      }
    }).html(function (d) {
      return d.fullName;
    }).attr('target', '_blank');
  tr.append('td')
    .append('a').attr('href', function (d) {
      return `https://www.fdsn.org/datacenters/detail/${d.name}/`
    }).attr('target', '_blank')
    .text(function (d) {return d.name;});
  tr.append('td')
    .append(function (d) {
      if (doesSupport(d, AV)) {
        const aElement = document.createElement('a');
        d3.select(aElement)
          .attr('href', createQuery(d, AV)
            .formBaseURL())
          .attr('class', 'supported')
          .text('Yes');
        return aElement;
      } else {
        const spanElement = document.createElement('span');
        d3.select(spanElement)
          .attr('class', 'unsupported')
          .text('No');
        return spanElement;
      }
    });
  tr.append('td')
    .append(function (d) {
      if (doesSupport(d, EV)) {
        const aElement = document.createElement('a');
        d3.select(aElement)
          .attr('href', createQuery(d, EV)
            .formBaseURL())
          .attr('class', 'supported')
          .text('Yes');
        return aElement;
      } else {
        const spanElement = document.createElement('span');
        d3.select(spanElement)
          .attr('class', 'unsupported')
          .text('No');
        return spanElement;
      }
    });
  tr.append('td')
    .append(function (d) {
      if (doesSupport(d, ST)) {
        const aElement = document.createElement('a');
        d3.select(aElement)
          .attr('href', createQuery(d, ST)
            .formBaseURL())
          .attr('class', 'supported')
          .text('Yes');
        return aElement;
      } else {
        const spanElement = document.createElement('span');
        d3.select(spanElement)
          .attr('class', 'unsupported')
          .text('No');
        return spanElement;
      }
    });
  tr.append('td')
    .append(function (d) {
      if (doesSupport(d, DS)) {
        const aElement = document.createElement('a');
        d3.select(aElement)
          .attr('href', createQuery(d, DS)
            .formBaseURL())
          .attr('class', 'supported')
          .text('Yes');
        return aElement;
      } else {
        const spanElement = document.createElement('span');
        d3.select(spanElement)
          .attr('class', 'unsupported')
          .text('No');
        return spanElement;
      }
    });
  tr.append('td')
    .append('button')
    .attr("dcid", function(d) {return d.name;})
    .text('Run')
    .on('click', function (d) {
      runAllTests(fdsn, d.target.getAttribute("dcid"), STOP_AT_FIRST_FAIL);
    });
}

function makeTestsTable (inTests, fdsn) {
  console.log('makeTestsTable: fdsn' + fdsn.datacenters.length);
  const div = d3.select('div.testlist');
  if (!div) { return; }
  div.selectAll('*').remove();
  const divP = div.append('h3');
  divP.text('Tests');
  let table = div.select('table');
  if (table.empty()) {
    table = d3.select('.testlist').append('table');
    const thr = table.append('thead').append('tr');
    thr.append('th').text('Test Name');
    thr.append('th').text('Run');
    thr.append('th').text('Service');
    thr.append('th').text('Test Code');
    thr.append('th').text('Detail');
    table.append('tbody');
  }

  const allTests = inTests.fdsnAvailabilityTests.concat(inTests.fdsnEventTests).concat(inTests.fdsnStationTests).concat(inTests.fdsnDataTests);

  const tableData = table.select('tbody')
    .selectAll('tr')
    .data(allTests);
  tableData.exit().remove();
  const tr = tableData.enter().append('tr').attr('class', function (test) { return test.testid; });
  tr.append('td')
    .text(function (test) {
      return test.testname;
    });
  tr.append('td')
    .append('button')
    .attr("testid", function(d) {return d.testid;})
    .text('Run')
    .on('click', function (d) {
      runOneTest(d.target.getAttribute("testid"), fdsn);
    });
  tr.append('td').append('span').text(function (test) {
    return test.webservices.join(' ');
  });
  tr.append('td')
    .append('a').attr('href', function (test) { return githubTestURL(test.testid); })
    .text('source');
  tr.append('td').append('span').text(function (test) {
    return test.description;
  });
}

function makeErrorMessage (errorMsg) {
  const div = d3.select('div.results');
  div.selectAll('*').remove();
  const divH3 = div.append('h3');
  divH3.text('Error');
  const divP = div.append('p');
  divP.text(errorMsg);
}

function makeResultsTable (dc, inTests) {
  const div = d3.select('div.results');
  div.selectAll('*').remove();
  const divP = div.append('h3');
  divP.text('Results for ');
  divP.append('a').attr('href', dc.url).text(dc.fullName);
  let table = div.select('table');
  if (table.empty()) {
    table = d3.select('.results').append('table');
    const thr = table.append('thead').append('tr');
    thr.append('th').text('Result');
    thr.append('th').text('Test Name');
    thr.append('th').text('Service');
    thr.append('th').text('Detail');
    thr.append('th').text('Output');
    thr.append('th').text('Runtime (s)');
    table.append('tbody');
  }

  let allTests = inTests.fdsnEventTests.concat(inTests.fdsnStationTests).concat(inTests.fdsnDataTests);

  allTests = allTests.filter(function (test) {
    return test.webservices.reduce(function (acc, wsType) {
      return acc && doesSupport(dc, wsType);
    }, true);
  });

  const tableData = table.select('tbody')
    .selectAll('tr')
    .data(allTests);
  tableData.exit().remove();
  const tr = tableData.enter().append('tr').attr('class', function (test) { return test.testid + ' ' + dc.name; });
  tr.append('td').attr('class', 'testresult');
  tr.append('td')
    .append('a').attr('href', function (test) { return githubTestURL(test.testid); })
    .text(function (test) {
      return test.testname;
    });
  tr.append('td').append('span').text(function (test) {
    return test.webservices.join(' ');
  });
  tr.append('td').append('span').text(function (test) {
    return test.description;
  });
  tr.append('td').attr('class', 'testmessage');
  tr.append('td').attr('class', 'runtime');
}

function makeResultsOneTestTable (test, fdsn) {
  console.log('makeResultsOneTestTable fdsnDCs: ' + fdsn.datacenters.length);
  const div = d3.select('div.results');
  div.selectAll('*').remove();
  const divP = div.append('h3');
  divP.text('Results for ');
  divP.append('a').attr('href', githubTestURL(test.testid)).text(test.testname);
  let table = div.select('table');
  if (table.empty()) {
    table = d3.select('.results').append('table');
    const thr = table.append('thead').append('tr');
    thr.append('th').text('Result');
    thr.append('th').text('Name');
    thr.append('th').text('Service');
    thr.append('th').text('Output');
    thr.append('th').text('Runtime (s)');
    table.append('tbody');
  }

  const tableData = table.select('tbody')
    .selectAll('tr')
    .data(fdsn.datacenters);
  tableData.exit().remove();
  const tr = tableData.enter().append('tr').attr('class', function (dc) { return test.testid + ' ' + dc.name; });
  tr.append('td').attr('class', 'testresult');
  tr.append('td')
    .append('a').attr('href', function (dc) {
      if (dc.website) {
        return dc.website;
      } else {
        return 'http://' + dc.host;
      }
    }).html(function (dc) {
      return dc.fullName;
    });
  tr.append('td').append('span').text(function (dc) {
    return serviceHost(dc, test.webservices[0]);
  });
  tr.append('td').attr('class', 'testmessage');
  tr.append('td').attr('class', 'runtime');
}

function runAllTests (fdsn, dcid, stopAtFirstFail) {
  if (! dcid ) {
    throw new Error("dcid not defined: "+dcid);
  }
  const continueOnFail = !stopAtFirstFail;
  // loop dc and tests...
  const dc = fdsn.datacenters.find(function (dc) {
    return dc.name === dcid;
  });
  if ( ! dc) {
    console.log(`dc not found for ${dcid}`);
  }
  makeResultsTable(dc, allFdsnTests);
  const dcTests = fdsn.datacenters
    .filter(function (dc) {
      return dc.name === dcid;
    }).map(function (dc) {
      const combinedTests = { dc: dc };
      const initEVTest = new Promise(function (resolve) {
        resolve(true);
      });
      const initSTTest = new Promise(function (resolve) {
        resolve(true);
      });
      const initDSTest = new Promise(function (resolve) {
        resolve(true);
      });

      if (doesSupport(dc, EV)) {
        combinedTests.fdsnevent = allFdsnTests.fdsnEventTests.reduce(function (acc, test) {
          return acc.then(function (prevResult) {
            if (continueOnFail || prevResult) {
              const sel = selectionForTestDC(test, dc);
              sel.append('span').text('Run');
              return runTestOnDC(test, dc, EV);
            } else {
              return false;
            }
          });
        }, initEVTest);
      }
      if (doesSupport(dc, ST)) {
        combinedTests.fdsnstation = allFdsnTests.fdsnStationTests.reduce(function (acc, test) {
          return acc.then(function (prevResult) {
            if (continueOnFail || prevResult) {
              const sel = selectionForTestDC(test, dc);
              sel.append('span').text('Run');
              return runTestOnDC(test, dc, ST);
            } else {
              return false;
            }
          });
        }, initSTTest);
      }
      if (doesSupport(dc, DS)) {
        combinedTests.fdsndataselect = allFdsnTests.fdsnDataTests.reduce(function (acc, test) {
          return acc.then(function (prevResult) {
            if (continueOnFail || prevResult) {
              const sel = selectionForTestDC(test, dc);
              sel.append('span').text('Run');
              return runTestOnDC(test, dc, DS);
            } else {
              return false;
            }
          });
        }, initDSTest);
      }
      return combinedTests;
    });

  Promise.all(dcTests.map(function (dcT) { return Promise.resolve(dcT); }))
    .then(function () { console.log('tests finished'); })
    .catch(function (r) {
      console.assert(false, r);
      console.log("oops, something didn't finish");
    });
}

function runOneTest (testid, fdsn) {
  // loop dc and tests...
  const test = allFdsnTests.all.find(function (d) {
    return d.testid === testid;
  });
  makeResultsOneTestTable(test, fdsn);
  const dcTests = fdsn.datacenters.map(function (dc) {
    const sel = d3.select('tr.' + dc.name).select('td.testresult');
    sel.append('span').text('Run');
    // wrong if test in on multiple server types
    return runTestOnDC(test, dc, test.webservices[0]);
  });
  return Promise.allSettled(dcTests)
    .then(function (settled) {
      console.log('runOneTest settled: ' + settled.length + ' ' + settled[0]);
    });
}
