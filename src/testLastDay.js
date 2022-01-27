
import { fdsnevent, fdsnstation, fdsndataselect, RSVP } from 'seisplotjs'
import { DS, EV, ST, createQuery, doesSupport } from './util'

export const testLastDay = {
  testname: 'Last Day',
  testid: 'LastDay',
  description: 'Queries for events in the past 24 hours',
  webservices: [EV],
  severity: 'severe',
  test: function (dc) {
    return new RSVP.Promise(function (resolve, reject) {
      if (!doesSupport(dc, EV)) {
        reject(new Error('Unsupported'))
      } else {
        resolve(null)
      }
    }).then(function () {
      const daysAgo = 1
      const quakeQuery = createQuery(dc, EV)
        .startTime(new Date(new Date().getTime() - 86400 * daysAgo * 1000))
        .endTime(new Date())
      const url = quakeQuery.formURL()
      return quakeQuery.query().then(function (quakes) {
        return {
          text: 'Found ' + quakes.length,
          url: url,
          output: quakes
        }
      }).catch(function (err) {
        if (!err.url) { err.url = url }
        throw err
      })
    })
  }
}
