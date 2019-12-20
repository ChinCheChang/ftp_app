// const ftp = require('./ftp')
// const ftp_worker = require('./ftp_worker')
const Datastore = require('nedb')
const config = require('./config')
const jsftp = require('./jsftp')
const winston = require('winston')

 function FtpFileHandler(cfg = {}) {
	this.createJsftp(cfg.ftp || config.ftp)
	this.createNedb('cameraFiles', cfg.nedb || config.nedb)
	this.createLogger(cfg.log || config.log)
}

FtpFileHandler.prototype.start = function() {

}

FtpFileHandler.prototype.createJsftp = function(cfg) {
	this.FTP = new jsftp(cfg)
}

FtpFileHandler.prototype.createNedb = function(dbName, cfg) {
	this.db = {}
	this.db[dbName] = new Datastore(cfg)
}

FtpFileHandler.prototype.createLogger = function(cfg) {
	this.logger = winston.createLogger(cfg)
}

module.exports = FtpFileHandler