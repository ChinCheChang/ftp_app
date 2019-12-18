/*jslint node: true, maxerr: 50, maxlen: 80 */

'use strict';

module.exports = function (options) {
    var ptp = require.main.require('./ptp');

    console.log('---------------------------------------- To connect host: ' + options.host);
    ptp.host = options.host;
    ptp.clientName = 'ptp.js demo';
    // additional optional parameters: `port`, `clientGuid`
    ptp.onDisconnected = function () {
        console.log('##### commands/connect: Disconnected');
        if (require('../../controller').getReconnectionFlag() && !require('../../controller').getMainPageFlag()) {
            require('../../controller').checkWifiState()
        }
    };
    ptp.onError = function (msg) {
        console.log('##### commands/connect: Failed to connect: ' + msg);
        console.error(msg);
        if (options.onError) options.onError();
    };
    ptp.onConnected = function () {
        console.log('##### commands/connect: Connected');
        options.onConnected();
    };
    ptp.connect();
};
