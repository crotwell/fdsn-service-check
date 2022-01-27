
import { fdsnevent, fdsnstation, fdsndataselect, RSVP } from 'seisplotjs'
import { DS, EV, ST, createQuery, doesSupport } from './util'

export const testCatalogs = {
  testname: 'Catalogs',
  testid: 'Catalogs',
  description: 'Queries the list of catalogs of the event service, success as long as the query returns something',
  webservices: [EV],
  severity: 'severe',
  test: function (dc) {
    return new RSVP.Promise(function (resolve, reject) {
      if (!doesSupport(dc, EV)) {
        reject(new Error('Unsupported'))
      } else {
        resolve(dc)
      }
    }).then(function (dc) {
      const quakeQuery = createQuery(dc, EV)
      const url = quakeQuery.formCatalogsURL()
      return quakeQuery.queryCatalogs().then(function (catalogs) {
        return {
          text: 'Found ' + catalogs.length,
          url: url,
          output: catalogs
        }
      }).catch(function (err) {
        if (!err.url) { err.url = url }
        throw err
      })
    })
  }
}
