/*jslint node: true, maxerr: 50, maxlen: 80 */

'use strict';

var ptp = require.main.require('./ptp'),
    util = require.main.require('./ptp/commands/util'), onConnected;

onConnected = function (propCode, failed, next) {
    var code;

    /*jslint evil: true */
    code = eval(propCode);
    /*jslint evil: false */

    console.log('Photo Capture');

    ptp.photoCapture({
        code: code,
        onSuccess: function (options) {
            console.log('Value (hex): ' + options.dataPacket.toString());
            ptp.disconnect();
			if (next) next(options.dataPacket);
        },
        onFailure: function () {
            console.error('Failed');
            ptp.disconnect();
			if (failed) failed();
        }
    });
};

module.exports = function (host, propCode, failed, next) {
    require.main.require('./ptp/commands/connect')({
        host: host,
        onConnected: onConnected.bind(this, propCode, failed, next)
    });
};
