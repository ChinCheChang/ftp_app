// PTP/IP packet. Documentation as of June 2014:
//
// <http://www.gphoto.org/doc/ptpip.php>

/*jslint browser: true, maxerr: 50, maxlen: 80 */

/*global define */

define(['./data-factory'], function (dataFactory) {
    'use strict';

    var types, headerLength = 8, transactionId = 0,
        createInitCommandRequest,
        createInitEventRequest,
        createCmdRequest,
        createStartDataPacket,
        createDataPacket,
        createEndDataPacket,
        startNewTransaction,
        parsePacket, parsePackets,
        setHeader,
        mainRemainingData,
        eventRemainingData,
        parsers = {}; // by packet type

    types = {
        initCommandRequest: 1,
        initCommandAck: 2,
        initEventRequest: 3,
        initEventAck: 4,
        initFail: 5,
        cmdRequest: 6,
        cmdResponse: 7,
        event: 8,
        startDataPacket: 9,
        dataPacket: 10,
        cancelTransaction: 11,
        endDataPacket: 12,
        ping: 13,
        pong: 14
    };

    Object.freeze(types);

    parsers[types.initCommandAck] = function (data) {
        return {
            sessionId: data.getDword(data.length - 2)
        };
    };

    parsers[types.initEventAck] = function () {
        return {}; // no payload
    };

    parsers[types.initFail] = function (data) {
        return {
            errorCode: data.getDword(0)
        };
    };

    parsers[types.event] = function (data) {
        return {
            eventCode: data.getWord(0),
            parameters: [
                data.getDword(2),
                data.getDword(6),
                data.getDword(10)
            ]
        };
    };

    parsers[types.cmdResponse] = function (data) {
        return {
            responseCode: data.getWord(0),
            transactionId: data.getDword(2),
            argsData: data.slice(6)
        };
    };

    parsers[types.startDataPacket] = function (data) {
        return {
            transactionId: data.getDword(0),
            dataSize: data.getDword(4) // without headers
        };
    };

    parsers[types.dataPacket] = function (data) {
        return {
            transactionId: data.getDword(0),
            payloadData: data.slice(4)
        };
    };

    parsers[types.endDataPacket] = function (data) {
        return {
            transactionId: data.getDword(0),
            payloadData: data.slice(4)
        };
    };

    setHeader = function (data, type) {
        data.setDword(0, data.length);
        data.setDword(4, type);
    };

    // Parses a packet, and returns the contents. Returns false on error.
    parsePacket = function (data, offs) {
        var content = {}, length, type, parser, unparsedData;

        if (data.length < 8) {
            return false; // not enough data, should not happen
        }

        length = data.getWord(offs);
        if (length < 1) {
            console.log("##### ERROR empty content");
            return content;
        }

        type = data.getWord(offs + 4);
        parser = parsers[type];

        unparsedData = data.slice(offs + headerLength, offs + length);
        if (parser !== undefined) {
            content = parser(unparsedData);
        } else {
            content = {
                unparsedData: unparsedData
            };
        }

        content.length = length;
        content.type = type;

        return content;
    };

    // Parses a piece of data that may contain several packets, concatenated.
    // Returns a list of contents of the parsed packets. Returns false on error.
    parsePackets = function (data, isEvent = false) {
        var offs = 0, packetContent, packetContentList = [];
        let remainingData = isEvent ? eventRemainingData : mainRemainingData;

        console.log("parsePackets remainingData=" + remainingData);
        let d = data;
        if (remainingData) {
            d = dataFactory.create();
            d.appendData(remainingData);
            d.appendData(data);
            remainingData = null;
        }
        console.log("parsePackets total len=" + d.length);
        while (true) {
            let len = d.getWord(offs); // expected length of the next packet
            console.log("parsePacket len=" + len);
            if (len < 4) {
                console.log("##### ERROR BAD HEADER #####");
                remainingData = null;
                break;
            }
            if (offs + len > d.length) {
                remainingData = d.slice(offs, d.length);
                break;
            } else {
                packetContent = parsePacket(d, offs);
                packetContentList.push(packetContent);
                offs += packetContent.length;
                if (offs == d.length) {
                    // end of data
                    break;
                }
            }
        }
        if (isEvent) eventRemainingData = remainingData;
        else mainRemainingData = remainingData;
        return packetContentList;
    };

    // Quote from the "White Paper of CIPA DC-005-2005": "[...] the Initiator
    // sends the *Init Command Request* PTP-IP packet that contains its identity
    // (GUID and Friendly Name).
    //
    // `guid` is a 16 byte array. It is cut off is longer, or zero padded if
    // shorter.
    createInitCommandRequest = function (guid, name) {
        var data = dataFactory.create(), i, x,
            maxLen = 80; // arbitrary limit, possibly could be longer

        for (i = 0; i < 16; i += 1) {
            x = (guid[i] === undefined) ? 0 : guid[i];
            data.setByte(headerLength + i, x);
        }

        //data.appendWstring(name.slice(0, maxLen));
        data.setByte(headerLength + 16, 0x6c); // l
        data.setByte(headerLength + 17, 0x00);
        data.setByte(headerLength + 18, 0x6f); // o
        data.setByte(headerLength + 19, 0x00);
        data.setByte(headerLength + 20, 0x63); // c
        data.setByte(headerLength + 21, 0x00);
        data.setByte(headerLength + 22, 0x61); // a
        data.setByte(headerLength + 23, 0x00);
        data.setByte(headerLength + 24, 0x6c); // l
        data.setByte(headerLength + 25, 0x00);
        data.setByte(headerLength + 26, 0x68); // h
        data.setByte(headerLength + 27, 0x00);
        data.setByte(headerLength + 28, 0x6f); // o
        data.setByte(headerLength + 29, 0x00);
        data.setByte(headerLength + 30, 0x73); // s
        data.setByte(headerLength + 31, 0x00);
        data.setByte(headerLength + 32, 0x74); // t
        data.setByte(headerLength + 33, 0x00);
        data.setByte(headerLength + 34, 0x00); // \0
        data.setByte(headerLength + 35, 0x00);

        data.appendWord(0);
        data.appendWord(1);

        setHeader(data, types.initCommandRequest);

        return data;
    };

    createInitEventRequest = function (sessionId) {
        var data = dataFactory.create();
        data.setDword(headerLength, sessionId);
        setHeader(data, types.initEventRequest);
        return data;
    };

    createCmdRequest = function (commandCode, args) {
        if (commandCode == '0x1002') {
			args = [1] //FIXME
			console.log("args,", args)
        }

        var data = dataFactory.create();

        data.setDword(headerLength, 1);
        data.appendWord(commandCode);
        data.appendDword(transactionId);

		if (commandCode == '0x9601') {
			data.appendDword(0xd001);
			data.appendDword(-1);
			data.appendDword(0);
        	setHeader(data, types.cmdRequest);
			return data;
		}

        if (args !== undefined) {
            args.forEach(function (arg) {
                data.appendDword(arg);
            });
        }

//        data.appendDword(1);
        setHeader(data, types.cmdRequest);

        return data;
    };

    createStartDataPacket = function (size) {
        var data = dataFactory.create();

        data.setDword(headerLength, transactionId);
        data.appendDword(size);
        data.appendDword(0);

        setHeader(data, types.startDataPacket);

        return data;
    };

    createDataPacket = function (payloadData) {
        var data = dataFactory.create();

        data.setDword(headerLength, transactionId);
        data.appendData(payloadData);

        setHeader(data, types.dataPacket);

        return data;
    };

    createEndDataPacket = function (payloadData) {
        var data = dataFactory.create();

        data.setDword(headerLength, transactionId);
        data.appendData(payloadData);

        setHeader(data, types.endDataPacket);

        return data;
    };

    startNewTransaction = function () {
        transactionId += 1;
    };

    return Object.create(null, {
        createInitCommandRequest: {value: createInitCommandRequest},
        createInitEventRequest: {value: createInitEventRequest},
        createCmdRequest: {value: createCmdRequest},
        createStartDataPacket: {value: createStartDataPacket},
        createDataPacket: {value: createDataPacket},
        createEndDataPacket: {value: createEndDataPacket},
        startNewTransaction: {value: startNewTransaction},
        types: {get: function () { return types; }},
        parsePackets: {value: parsePackets},
        transactionId: {get: function () { return transactionId; }}
    });
});
