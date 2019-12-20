'use strict'

const winston = require('winston')

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
			new winston.transports.Console(),
			new winston.transports.File({ filename: './log/combined.log' })
		]
	}
}

module.exports = config