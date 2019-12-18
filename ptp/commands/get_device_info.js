/*jslint node: true, maxerr: 50, maxlen: 80 */

'use strict';

var ptp = require.main.require('./ptp'),
	util = require.main.require('./ptp/commands/util'), onConnected;

onConnected = function () {
    console.log('Get Device Info')

    ptp.getDeviceInfo({
        onSuccess: function (options) {
            console.log('getDeviceInfo result', options);
            ptp.disconnect();
        },
        onFailure: function () {
            console.error('Failed');
            ptp.disconnect();
        }
    });
};

module.exports = function (host) {
    require.main.require('./ptp/commands/connect') ({
        host: host,
        onConnected: onConnected
    });
};
