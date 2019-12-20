'use strict'

const config = {
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
	}
}

module.exports = config