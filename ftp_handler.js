const Datastore = require('nedb')
const config = require('./config')
const winston = require('winston')
const custJsftp = require('./costomized_jsftp/cust_jsftp')
const Seq_worker = require('./seq_worker')
const jsftpPromise = require('./costomized_jsftp/jsftp_promise1')

function FtpFileHandler(cfg = {}) {
	this.createLogger(cfg.log || config.log)
	this.createJsftp(cfg.ftp || config.ftp)
	this.createNedb('cameraFiles', cfg.nedb || config.nedb)	
	this.createWorker()
}

FtpFileHandler.prototype.createLogger = function(cfg) {
	this.logger = winston.createLogger(cfg)
}

FtpFileHandler.prototype.createJsftp = function(cfg) {
	this.logger.info('init FTP')
	this.FTP = new jsftpPromise(custJsftp(cfg), this.logger)
}

FtpFileHandler.prototype.createNedb = function(dbName, cfg) {
	this.logger.info('init NeDB')
	this.db = {}
	this.db[dbName] = new Datastore(cfg)
}

FtpFileHandler.prototype.createWorker = function() {
	this.logger.info('init Worker')
	this.Worker =  new Seq_worker( this.FTP, (taskInQueue, task) => {
		return taskInQueue.name === task.name && taskInQueue.parameters[0] == task.parameters[0]
	}, this.logger)	
}

FtpFileHandler.prototype.listAll = function(path, array) {
	return new Promise((resolve, reject) => {			
		this.Worker.push({
			name: "listAll",
			parameters: [
				path, 
				() => {	reject('error')	}, 
				(res) => { resolve(res); }],
			description: `list ${path}`
		});							
	})
}

module.exports = FtpFileHandler