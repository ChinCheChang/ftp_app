// const ftp = require('./ftp')
// const ftp_worker = require('./ftp_worker')
const Datastore = require('nedb')
const config = require('./config')
const jsftp = require('./jsftp')
const winston = require('winston')

const debug = require('debug')('files_controller')

debug('test begin')

function FileHandler(cfg = config) {
	this.ftpcfg = cfg.ftp
	this.nedbcfg = cfg.nedb
	this.db = {}

	this.FTP = new jsftp( this.ftpcfg )
	this.db.cameraFiles = new Datastore( this.nedbcfg )
	this.logger = winston.createLogger(config.log)
}

const ff = new FileHandler()

ff.logger.info('Hello distributed log files!')