/*jslint node: true, maxerr: 50, maxlen: 80 */

'use strict';

var ptp = require.main.require('./ptp'), onConnected;

onConnected = function () {
    console.log('Capturing...');
    ptp.capture({
        storageId: 0, // optional
        objectFormatCode: 0, // optional
        onSuccess: function () {
            console.log('Finished');
            ptp.disconnect();
        },
        onFailure: function () {
            console.error('Failed');
            ptp.disconnect();
        }
    });
};

module.exports = function (host) {
    require.main.require('./ptp/commands/connect')({
        host: host,
        onConnected: onConnected
    });
};
