/*jslint node: true, maxerr: 50, maxlen: 80 */

'use strict'

var ptp = require.main.require('./ptp')
var util = require.main.require('./ptp/commands/util'), onConnected, onError
var sendSystemCommand

onError = function (values, failed, next) {
	if (failed) failed();
}

sendSystemCommand = function (values, failed, next) {
	if (values && values.length > 0) {
		let value = values.shift()
		console.log('To send: ' + value)
		ptp.setDeviceProperty({
			code: eval('0xD80F'),
			data: eval('ptp.dataFactory.' + value),
			onSuccess: function () {
				console.log('Sent: ' + value)
				if (values.length > 0) sendSystemCommand(values, failed, next)
				else if (next) next()
			},
			onFailure: function () {
				console.error('Failed')
				ptp.disconnect()
				if (failed) failed()
			}
		})
		if (value == 'createWstring("reboot")') {
			// just proceed, it will not return successfully
			if (next) next()
		}
	} else {
		if (next) next()
	}
}

onConnected = function (values, failed, next) {
	sendSystemCommand(values, failed, next)
}

module.exports = function (host, values, failed, next) {
	require.main.require('./ptp/commands/connect') ({
		host: host,
		onConnected: onConnected.bind(this, values, failed, next),
		onError: onError.bind(this, values, failed, next)
	});
};
