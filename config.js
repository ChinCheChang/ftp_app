'use strict'

const moment = require('moment')
const { format, transports } = require('winston');
const { combine, timestamp, prettyPrint, label } = format;

const config = {
	mode: 'dev',
	ftp: {
		host: 'ftp.fasmedo.com',
		user: 'fasmedo',
		pass: 'faspro',
		debugMode: true,
		useList: true
	},
	nedb: {
		filename: './db/test',
    autoload: true
	},
	log: {
		transports: [
			new transports.Console(),
			new transports.File({ filename: `./log/${moment(new Date()).format('YYYY-MM-DDTHH-mm-ss')}.log` })
		],
		format: combine(
			label({ label: 'FTP log' }),
			timestamp(),
			prettyPrint()
		)
	}
}

module.exports = config