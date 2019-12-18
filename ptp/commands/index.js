// For processing commands.

/*jslint node: true, maxerr: 50, maxlen: 80 */

'use strict';

var commands, help, run, lengthOfLongestCommand, pad, findCommand,
    commandNameWithParameters, exampleParameters,
    syntaxIsCorrect;
var ptp = require.main.require('./ptp');
var util = require.main.require('./ptp/commands/util');

commands = [
    {
        name: 'photo_capture',
        parameters: [
            {name: 'host', example: '192.168.1.1'},
            {name: 'prop_code', example: '0x5001'}
        ],
        description: 'take picture in photo mode'
    },
    {
        name: 'capture',
        parameters: [
            {name: 'host', example: '192.168.1.1'}
        ],
        description: 'initiate capture'
    },
    {
        name: 'get_device_properties',
        parameters: [
            {name: 'host', example: '192.168.1.1'},
            {name: 'prop_codes', example: '[0x5001]'}
        ],
        description: 'get value of all required properties'
    },
    {
        name: 'get_camera_info',
        parameters: [
            {name: 'host', example: '192.168.1.1'}
        ],
        description: 'get serial number and firmware version'
    },
    {
        name: 'monitor_device_properties',
        parameters: [
            {name: 'host', example: '192.168.1.1'},
            {name: 'prop_codes', example: '[0x5001]'}
        ],
        description: 'monitor value of device properties'
    },
    {
        name: 'get_device_property',
        parameters: [
            {name: 'host', example: '192.168.1.1'},
            {name: 'prop_code', example: '0x5001'}
        ],
        description: 'get value of property'
    },
    {
        name: 'send_host_request',
        parameters: [
            {name: 'host', example: '192.168.1.1'},
            {name: 'prop_code', example: '0x5001'}
        ],
        description: 'send host request'
    },
    {
        name: 'set_device_property',
        parameters: [
            {name: 'host', example: '192.168.1.1'},
            {name: 'prop_code', example: '0x5010'},
            {name: 'value', example: 'createWord(1000)'}
        ],
        description: 'set value of property'
    },
    {
        name: 'send_system_commands',
        parameters: [
            {name: 'host', example: '192.168.1.1'},
            {name: 'values', example: 'array'}
        ],
        description: 'send system scommands'
    },
    {
        name: 'device_prop_codes',
        description: 'device property codes'
    },
    {
        name: 'date_time_string',
        description: 'PTP format of current time'
    },
    {
        name: 'get_object_handles',
        parameters: [
            {name: 'host', example: '192.168.1.1'},
            {name: 'storageId', example: '0xffffffff'}
        ],
        description: 'handles of files and folders'
    },
    {
        name: 'get_object_info',
        parameters: [
            {name: 'host', example: '192.168.1.1'},
            {name: 'object_handle', example: '6620401'}
        ],
        description: 'description of object'
    },
    {
        name: 'get_object',
        parameters: [
            {name: 'host', example: '192.168.1.1'},
            {name: 'object_handle', example: '6620401'},
            {name: 'filename', example: 'photo.jpg'}
        ],
        description: 'download object'
    },
    {
        name: 'delete_object',
        parameters: [
            {name: 'host', example: '192.168.1.1'},
            {name: 'object_handle', example: '6620401'}
        ],
        description: 'delete object'
    },
    {
        name: 'get_storage_ids',
        parameters: [
            {name: 'host', example: '192.168.1.1'}
        ],
        description: 'get storage ids'
    },
    {
        name: 'get_device_info',
        parameters: [
            {name: 'host', example: '192.168.1.1'}
        ],
        description: 'get device info'
    },
    {
        name: 'open_session',
        parameters: [
            {name: 'host', example: '192.168.1.1'}
        ],
        description: 'open session'
    }
];

commandNameWithParameters = function (command) {
    var a = [command.name];

    if (command.parameters !== undefined) {
        command.parameters.forEach(function (parameter) {
            a.push(parameter.name);
        });
    }

    return a.join(' ');
};

lengthOfLongestCommand = function () {
    return commands.reduce(function (length, command) {
        return Math.max(length, commandNameWithParameters(command).length);
    }, 0);
};

exampleParameters = function (command) {
    if (command.parameters === undefined) {
        return '';
    }
    return command.parameters.map(function (parameter) {
        return parameter.example;
    }).join(' ');
};

help = function () {
    var l = lengthOfLongestCommand();
    console.log('  Commands:');
    console.log('');
    commands.forEach(function (command) {
        console.log('    ' + util.pad(commandNameWithParameters(command), l) +
                    '  ' + command.description);
    });
    console.log('');
    console.log('  Examples:');
    console.log('');
    commands.forEach(function (command) {
        console.log('    ' + command.name + ' ' +
                    exampleParameters(command));
    });
};

findCommand = function (commandName) {
    var i, command;
    for (i = 0; i < commands.length; i += 1) {
        command = commands[i];
        if (command.name === commandName) {
            return command;
        }
    }
    return null;
};

run = function (options) {
    if (options.commandName == 'get_device_property')
        console.log('##### Run Command: ' + options.commandName + ':' + options.parameters[1])
    else
        console.log('##### Run Command: ' + options.commandName)
    var command = findCommand(options.commandName);

    if (command === null) {
        return;
    }

    ptp.loggerOutputIsEnabled = options.verboseOutputIsRequested;

    require.main.require('./ptp/commands/' + command.name).apply(this, options.parameters);
};

syntaxIsCorrect = function (options) {
    var command = findCommand(options.commandName);
    if (command === null) {
        return false;
    }
    if (command.parameters !== undefined &&
            command.parameters.length !== options.parameters.length) {
        return false;
    }
    return true;
};

module.exports = Object.create(null, {
    help: {value: help},
    run: {value: run},
    syntaxIsCorrect: {value: syntaxIsCorrect}
});
