/*jslint browser: true, maxerr: 50, maxlen: 80 */

/*global define */

define([
    './command', './main-loop', './data-factory', './util'
], function (command, mainLoop, dataFactory, util) {
    'use strict';

    var onDeviceInfo;

    onDeviceInfo = function (options) {
        util.runIfSet(options.onSuccess, {
            dataPacket: options.dataPacket
        });
    };

    return function (options) {
        var onSuccess, dataPacket = dataFactory.create();

        onSuccess = function (options2) {
            onDeviceInfo({
                onSuccess: options.onSuccess,
                transactionId: options2.transactionId,
                argsData: options2.receivedContent.argsData,
                dataPacket: dataPacket
            });
        };

        command.sendCommand({
            operationCode: 0x1001,
            args: [],
            payload: options.data,
            onDataPacket: function (packetContent) {
                dataPacket.appendData(packetContent.payloadData);
            },
            onEndDataPacket: function (packetContent) {
                dataPacket.appendData(packetContent.payloadData);
            },
            onSuccess: onSuccess,
            onFailure: options.onFailure
        });
    };
});
