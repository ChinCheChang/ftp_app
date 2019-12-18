/*jslint node: true, maxerr: 50, maxlen: 80 */

'use strict';

var util = require.main.require('./ptp/commands/util');
var ptp = require.main.require('./ptp');
var onConnected;

onConnected = function (objectHandle) {
    console.log('Deleting object ' + objectHandle + '...');

    ptp.deleteObject({
        objectHandle: objectHandle,
        objectFormatCode: 0, // optional
        onSuccess: function () {
            console.error('Done');
            ptp.disconnect();
        },
        onFailure: function () {
            console.error('Failed');
            ptp.disconnect();
        }
    });
};

module.exports = function (host, objectHandle) {
    require.main.require('./ptp/commands/connect')({
        host: host,
        onConnected: onConnected.bind(this, objectHandle)
    });
};
