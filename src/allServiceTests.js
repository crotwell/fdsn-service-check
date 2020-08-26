
import * as seisplotjs from 'seisplotjs';
import {AV, DS, EV, ST, serviceHost, doesSupport } from './util';

import {testAvailabilityVersion} from './testAvailabilityVersion';
import {testNoData204Availability} from './testNoData204Availability';
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
import {testNetworksIncludeAvailability} from './testNetworksIncludeAvailability';
import {testNetworksIncludeRestricted} from './testNetworksIncludeRestricted';
import {testStations} from './testStations';
import {testCommaStations} from './testCommaStations';
import {testStationNowEndTime} from './testStationNowEndTime.js';
import {testSimpleAndWindowTimes} from './testSimpleAndWindowTimes';
import {testStationQueryWithZ} from './testStationQueryWithZ';
import {testStationDateIncludeZ} from './testStationDateIncludeZ';
import {testStationCrossDateLine} from './testStationCrossDateLine';
import {testChannels} from './testChannels';
import {testSensitivityUnit} from './testSensitivityUnit';
import {testNoData204DataSelect} from './testNoData204DataSelect';
import {testDataSelectNoData} from './testDataSelectNoData';
import {testDataSelectRecent} from './testDataSelectRecent';
import {testDataSelectFormat} from './testDataSelectFormat';



let fdsnavailability = seisplotjs.fdsnavailability;
let fdsnevent = seisplotjs.fdsnevent;
let fdsnstation = seisplotjs.fdsnstation;
let fdsndataselect = seisplotjs.fdsndataselect;
let RSVP = seisplotjs.RSVP;

// all tests should be object with testid, testname and test: function(datacenter, d3selector)

// end test defs


let tests = {
     fdsnAvailabilityTests: [testAvailabilityVersion, testNoData204Availability],
     fdsnEventTests: [ testEventVersion, testNoData204Event, testNoDataEvent, testLastDay, testCatalogs, testContributors, testEventFractionalSeconds, testEventFromBestGuessEventId, testLastDayQueryWithZ, testDateIncludeZ, testEventCrossDateLine, testEventFromPublicID  ],
     fdsnStationTests: [ testStationVersion, testNoData204Station, testNoDataNetwork, testNetworks, testStations, testChannels, testCommaStations, testStationNowEndTime, testSimpleAndWindowTimes, testNetworksIncludeAvailability, testNetworksIncludeRestricted, testStationQueryWithZ, testStationDateIncludeZ, testStationCrossDateLine, testSensitivityUnit ],
     fdsnDataTests: [ testDataSelectVersion, testNoData204DataSelect, testDataSelectNoData, testDataSelectRecent, testDataSelectFormat ]
 };

tests.all = tests.fdsnAvailabilityTests.concat(tests.fdsnEventTests).concat(tests.fdsnStationTests).concat(tests.fdsnDataTests);

let notVersionTest = {
     fdsnAvailabilityTests: tests.fdsnAvailabilityTests.filter(function(d) {
         return d.testid.indexOf("version") === -1;
     }),
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
notVersionTest.all = notVersionTest.fdsnAvailabilityTests.concat(notVersionTest.fdsnEventTests).concat(notVersionTest.fdsnStationTests).concat(notVersionTest.fdsnDataTests);

let justOneTest = {
     fdsnAvailabilityTests: [  ],
     fdsnEventTests: [ ],
     fdsnStationTests: [ testStationNowEndTime ],
     fdsnDataTests: [ ]
};
justOneTest.all = justOneTest.fdsnAvailabilityTests.concat(justOneTest.fdsnEventTests).concat(justOneTest.fdsnStationTests).concat(justOneTest.fdsnDataTests);

let justVersionTest = {
     fdsnAvailabilityTests: [ testAvailabilityVersion ],
     fdsnEventTests: [ testEventVersion ],
     fdsnStationTests: [ testStationVersion ],
     fdsnDataTests: [ testDataSelectVersion ]
};
justVersionTest.all = justVersionTest.fdsnAvailabilityTests.concat(justVersionTest.fdsnEventTests).concat(justVersionTest.fdsnStationTests).concat(justVersionTest.fdsnDataTests);

//export const allFdsnTests = notVersionTest;
//export const allFdsnTests = justVersionTest;
//export const allFdsnTests =  justOneTest;
export const allFdsnTests = tests;
