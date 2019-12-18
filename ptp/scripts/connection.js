/*jslint browser: true, maxerr: 50, maxlen: 80 */

/*global define */

define([
    './main-loop', './event-loop', './event-listeners-factory'
], function (mainLoop, eventLoop, eventListenersFactory) {
    'use strict';

    var connect, disconnect, isConnected = false, isConnecting = false,
        forceDisconnect, toKeepConnection = true,
        eventListeners = eventListenersFactory.create();
    var isConnectingCount = 0;

    mainLoop.onDisconnected = eventLoop.onDisconnected = function () {
        if (isConnected) {
            eventListeners.run('disconnected');
        }
        mainLoop.stop();
        eventLoop.stop();
        isConnected = false;
        isConnecting = false;
        isConnectingCount = 0;
    };

    mainLoop.onError = eventLoop.onError = function (msg) {
        mainLoop.stop();
        eventLoop.stop();
        eventListeners.run('error', msg);
    };

    mainLoop.onInitialized = function () {
        // Event loop is initialized immediately after initialization of main
        // loop, in accordance with section "5.4 Establishment of PTP-IP
        // Connection" in: White Paper of CIPA DC-005-2005
        console.log('##### mainLoop.onInitialized #####');
        eventLoop.sessionId = mainLoop.sessionId - 1;
        eventLoop.initialize();
    };

    eventLoop.onInitialized = function () {
        console.log('##### eventLoop.onInitialized #####');
        mainLoop.onSessionOpened = function () {
            console.log('##### mainLoop.onSessionOpened #####');
            isConnected = true;
            eventListeners.run('connected');
        };
        mainLoop.openSession();
    };

    // Calling this function again, even during the process of connecting, is
    // safe.
    connect = function () {
        console.log('##### ptp.connect ##### (' + isConnected + ',' + isConnecting + ',' + isConnectingCount + ')');
        if (isConnected) {
            eventListeners.run('connected');
            return;
        }

        if (isConnecting) {
          if (++isConnectingCount < 5) {
            return;
          }
          mainLoop.stop();
          eventLoop.stop();
        }

        isConnecting = true;
        isConnectingCount = 0;
        mainLoop.initialize();
    };

    disconnect = function () {
        if (!toKeepConnection) forceDisconnect();
    };

    forceDisconnect = function () {
        mainLoop.stop();
        eventLoop.stop();
    };

    return Object.create(null, {
        addEventListener: {value: eventListeners.add},
        removeEventListener: {value: eventListeners.remove},
        isConnected: {get: function () {
            return isConnected;
        }},
        connect: {value: connect},
        forceDisconnect: {value: forceDisconnect},
        disconnect: {value: disconnect}
    });
});
