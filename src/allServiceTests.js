
import * as seisplotjs from 'seisplotjs';
import {DS, EV, ST, serviceHost, doesSupport } from './util';

import {testEventVersion} from './testEventVersion';
import {testStationVersion} from './testStationVersion';
import {testDataSelectVersion} from './testDataSelectVersion';
import {testNoData204Event} from './testNoData204Event';
import {testNoDataEvent} from './testNoDataEvent';
import {testLastDay} from './testLastDay';
import {testEventFractionalSeconds} from './testEventFractionalSeconds';
import {testLastDayQueryWithZ} from './testLastDayQueryWithZ';
import {testEventCrossDateLine} from './testEventCrossDateLine';
import {testDateIncludeZ} from './testDateIncludeZ';
import {testEventFromPublicID} from './testEventFromPublicID';
import {testEventFromBestGuessEventId} from './testEventFromBestGuessEventId';
import {testCatalogs} from './testCatalogs';
import {testContributors} from './testContributors';
import {testNoData204Station} from './testNoData204Station';
import {testNoDataNetwork} from './testNoDataNetwork';
import {testNetworks} from './testNetworks';
import {testStations} from './testStations';
import {testCommaStations} from './testCommaStations';
import {testSimpleAndWindowTimes} from './testSimpleAndWindowTimes';
import {testStationQueryWithZ} from './testStationQueryWithZ';
import {testStationDateIncludeZ} from './testStationDateIncludeZ';
import {testStationCrossDateLine} from './testStationCrossDateLine';
import {testChannels} from './testChannels';
import {testSensitivityUnit} from './testSensitivityUnit';
import {testNoData204DataSelect} from './testNoData204DataSelect';
import {testDataSelectNoData} from './testDataSelectNoData';
import {testDataSelectRecent} from './testDataSelectRecent';


let fdsnevent = seisplotjs.fdsnevent;
let fdsnstation = seisplotjs.fdsnstation;
let fdsndataselect = seisplotjs.fdsndataselect;
let RSVP = fdsnstation.RSVP;

// all tests should be object with testid, testname and test: function(datacenter, d3selector)

// end test defs


let tests = {
     fdsnEventTests: [ testEventVersion, testNoData204Event, testNoDataEvent, testLastDay, testCatalogs, testContributors, testEventFractionalSeconds, testEventFromBestGuessEventId, testLastDayQueryWithZ, testDateIncludeZ, testEventCrossDateLine, testEventFromPublicID  ],
     fdsnStationTests: [ testStationVersion, testNoData204Station, testNoDataNetwork, testNetworks, testStations, testChannels, testCommaStations, testSimpleAndWindowTimes, testStationQueryWithZ, testStationDateIncludeZ, testStationCrossDateLine, testSensitivityUnit ],
     fdsnDataTests: [ testDataSelectVersion, testNoData204DataSelect, testDataSelectNoData, testDataSelectRecent ]
 };

tests.all = tests.fdsnEventTests.concat(tests.fdsnStationTests).concat(tests.fdsnDataTests);

let notVersionTest = {
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
let justOneTest = {
     fdsnEventTests: [ testEventFromBestGuessEventId,  testEventCrossDateLine],
     fdsnStationTests: [ testStationCrossDateLine ],
     fdsnDataTests: [ ]
};
let justVersionTest = {
     fdsnEventTests: [ testEventVersion ],
     fdsnStationTests: [ testStationVersion ],
     fdsnDataTests: [ testDataSelectVersion ]
};

//let out = notVersionTest;
//let out = justVersionTest;
//let out = justOneTest;
export let allFdsnTests = tests;
