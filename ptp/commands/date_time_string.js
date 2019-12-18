/*jslint node: true, maxerr: 50, maxlen: 80 */

'use strict';

var ptp = require.main.require('./ptp');

module.exports = function () {
    console.log(ptp.dateTimeString({
        date: new Date(),
        appendTimeZone: '+/-hhmm'
    }));
};
