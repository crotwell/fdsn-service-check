
import { fdsnevent, fdsnstation, fdsndataselect, util, RSVP } from 'seisplotjs'
import { DS, EV, ST, createQuery, doesSupport } from './util'

export const testNoData204DataSelect = {
  testname: 'DataSelect 204',
  testid: 'NoData204DataSelect',
  description: 'Check that 204 is returned for queries for dataselect that should be valid but return no data without nodata=404. Success if 204 http status is returned. This can also be a check on the CORS header.',
  webservices: [DS],
  severity: 'severe',
  test: function (dc) {
    return new RSVP.Promise(function (resolve, reject) {
      if (!doesSupport(dc, DS)) {
        reject(new Error(DS + ' Unsupported by ' + dc.id))
      } else {
        resolve(null)
      }
    }).then(function () {
      const query = createQuery(dc, DS)
      const url = query
        .networkCode('XX')
        .stationCode('ABC')
        .locationCode('99')
        .channelCode('XXX')
        .timeWindow(new util.StartEndDuration('1980-01-01T00:00:00', null, 300))
        .formURL()
      return new Promise(function (resolve, reject) {
        const client = new XMLHttpRequest()
        client.open('GET', url)
        client.onreadystatechange = handler
        client.responseType = 'arraybuffer'
        client.setRequestHeader('Accept', 'application/vnd.fdsn.mseed')
        client.send()

        function handler () {
          if (this.readyState === this.DONE) {
            if (this.status === 200) {
              reject(new Error('Should be no data, but received 200 http status code.'))
            } else if (this.status === 404) {
              reject(new Error('Should be 204 no data, but received 404 http status code.'))
            } else if (this.status === 204) {
              // 204 is nodata, so successful but empty
              resolve({
                text: '204 ',
                url: url,
                output: 204
              })
            } else {
              const error = new Error('Unexpected http status code: ' + this.status)
              error.status = this.status
              error.statusText = this.statusText
              reject(error)
            }
          }
        }
      }).catch(function (err) {
        if (!err.url) { err.url = url }
        throw err
      })
    })
  }
}
