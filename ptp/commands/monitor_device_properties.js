/*jslint node: true, maxerr: 50, maxlen: 80 */

'use strict';

var ptp = require.main.require('./ptp'),
    util = require.main.require('./ptp/commands/util'), onConnected, onError;

var successCallback, failedCallback;
var result = {}

var getDeviceProp = function (propCode, name, isString = false) {
	return new Promise((resolve, reject) => {
	    ptp.getDeviceProperty({
	        code: eval(propCode),
	        onSuccess: function (options) {
	            console.log('Value (hex): ' + options.dataPacket.toString());
				if (isString)
					result[name] = options.dataPacket.getWstring(0);
				else
					result[name] = options.dataPacket.getWord(0);
				resolve();
	        },
	        onFailure: function () {
	            console.error('Failed');
				ptp.disconnect();
				reject();
	        }
	    });
	});
};

var finish = function () {
	console.log('##### Finished: ', result);
	ptp.disconnect();
	if (successCallback) successCallback(result);
};

var handleFailure = function () {
	console.log('##### Failed: ', result);
	ptp.disconnect();
	if (failedCallback) failedCallback();
};

onError = function (propCodes) {
	handleFailure();
}

onConnected = function (propCodes) {
	getDeviceProp('0x5001', 'battery').then(() => {
		return getDeviceProp('0xD717', 'tof');
	}).then(finish).catch(handleFailure);
};

module.exports = function (host, propCode, failed, next) {
	successCallback = next
	failedCallback = failed
	require.main.require('./ptp/commands/connect')({
		host: host,
		onConnected: onConnected.bind(this, propCode),
		onError: onError.bind(this, propCode)
	});
};
