
import { fdsnavailability, fdsnstation, fdsndataselect, RSVP } from 'seisplotjs'
import { AV, DS, EV, ST, createQuery, doesSupport } from './util'

export const testAvailabilityVersion = {
  testname: 'Availability Version',
  testid: 'AvailabilityVersion',
  description: 'Queries the version of the service, success as long as the query returns something',
  webservices: [AV],
  severity: 'severe',
  test: function (dc) {
    const query = createQuery(dc, AV)
    const url = query.formVersionURL()
    return query.queryVersion().then(function (version) {
      return {
        text: version,
        output: version,
        url: url
      }
    }).catch(function (err) {
      if (!err.url) { err.url = url }
      throw err
    })
  }
}
