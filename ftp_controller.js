const Datastore = require('nedb')
const config = require('./config')
const winston = require('winston')
const custJsftp = require('./customized_jsftp/cust_jsftp')
const Seq_worker = require('./seq_worker')
const jsftpPromise = require('./customized_jsftp/jsftp_promise')
const Ftp_handler = require('./handlers/ftp_handler')


function FtpFileHandler(cfg = {}) {
	this.btName = cfg.btName || config.btName
	this.createLogger(cfg.log || config.log)
	this.createJsftp(cfg.ftp || config.ftp)
	this.createNedb(cfg.nedb || config.nedb)
	this.createHandler()	
	this.createWorker()
}

FtpFileHandler.prototype.createLogger = function(cfg) {
	this.logger = winston.createLogger(cfg)
}

FtpFileHandler.prototype.createJsftp = function(cfg) {
	this.logger.info('init FTP')
	this.FTP = new jsftpPromise(custJsftp(cfg), this.logger)
}

FtpFileHandler.prototype.createNedb = function(cfg) {
	this.logger.info('init NeDB')
	this.db = {}
	this.db = new Datastore(cfg)
}

FtpFileHandler.prototype.createHandler = function() {
	this.logger.info('init ftp_handler')
	this.Ftp_handler = new Ftp_handler(this.db, this.logger)
}

FtpFileHandler.prototype.createWorker = function() {
	this.logger.info('init Worker')
	this.Worker =  new Seq_worker( this.FTP, (taskInQueue, task) => {
		return taskInQueue.name === task.name && taskInQueue.parameters[0] == task.parameters[0]
	}, this.logger)	
}

FtpFileHandler.prototype.list = function(path) {		
	let afterFailed = (error) => {	console.log( error ) }

	this.Worker.push({
		name: "list",
		parameters: {
			path, 
			failed: afterFailed, 
			succeed: (res) => { this.Ftp_handler.listSucceed(res, path) }
		},
		description: `list ${path}`
	});							
}

// FtpFileHandler.prototype.get = function(media, localpath) {
// 	this.Worker.push({
// 		name: 'get'
// 	})
// }

module.exports = FtpFileHandler