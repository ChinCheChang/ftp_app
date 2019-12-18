/*jslint node: true, maxerr: 50, maxlen: 80 */

'use strict';

var ptp = require.main.require('./ptp'),
	util = require.main.require('./ptp/commands/util'), onConnected;

onConnected = function (storageId) {
    console.log('Getting object handles...');

    ptp.getObjectHandles({
        storageId: storageId, //0x00060001, // all stores
        objectFormatCode: 0, // optional
        //objectHandleOfAssociation: 0, // optional
        objectHandleOfAssociation: 0xffffffff, // optional
        onSuccess: function (options) {
            console.log(options.handles.length === 0 ?
                        'No objects found' :
                        'Handles: ' + options.handles.join(', '));
            ptp.disconnect();
        },
        onFailure: function () {
            console.error('Failed');
            ptp.disconnect();
        }
    });
};

module.exports = function (host, storageId) {
    require.main.require('./ptp/commands/connect') ({
        host: host,
        onConnected: onConnected.bind(this, storageId)
    });
};
