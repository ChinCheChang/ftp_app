/*jslint node: true, maxerr: 50, maxlen: 80 */

'use strict';

var ptp = require.main.require('./ptp')
var util = require.main.require('./ptp/commands/util'), onConnected, onError;

onError = function (propCode, value, failed, next) {
    if (failed) failed();
}

onConnected = function (propCode, value, failed, next) {
    var code, data;

    /*jslint evil: true */
    code = eval(propCode);
    data = eval('ptp.dataFactory.' + value);
    /*jslint evil: false */

    console.log('Setting ' + util.prettyPrintDeviceProperty(code) + ' to ' +
                data.toString() + '...');

    ptp.setDeviceProperty({
        code: code,
        data: data,
        onSuccess: function () {
            console.log('Set');
            ptp.disconnect();
			if (next) next();
        },
        onFailure: function () {
            console.error('Failed');
            ptp.disconnect();
            if (failed) failed();
        }
    });
};

module.exports = function (host, propCode, value, failed, next) {
    require.main.require('./ptp/commands/connect')({
        host: host,
        onConnected: onConnected.bind(this, propCode, value, failed, next),
        onError: onError.bind(this, propCode, value, failed, next)
    });
};
