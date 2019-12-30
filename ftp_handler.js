const Datastore = require('nedb')
const config = require('./config')
const winston = require('winston')
const custJsftp = require('./costomized_jsftp/cust_jsftp')
const Seq_worker = require('./seq_worker')
const jsftpPromise = require('./costomized_jsftp/jsftp_promise1')
const moment = require('moment')

function FtpFileHandler(cfg = {}) {
	this.btName = cfg.btName || config.btName
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
	this.db = new Datastore(cfg)
}

FtpFileHandler.prototype.createWorker = function() {
	this.logger.info('init Worker')
	this.Worker =  new Seq_worker( this.FTP, (taskInQueue, task) => {
		return taskInQueue.name === task.name && taskInQueue.parameters[0] == task.parameters[0]
	}, this.logger)	
}

FtpFileHandler.prototype.list = function(path) {		
	this.Worker.push({
		name: "list",
		parameters: {
			path, 
			failed: (error) => {	console.log( error ) }, 
			succeed: (res) => {
				this.mediaCreater(res, path).map((value) => {
					this.db.insert(value)
				})
			}},
		description: `list ${path}`
	});							
}

FtpFileHandler.prototype.mediaCreater = function(mediaArray, remotePath, localPath) {
	let formatHandler = (filename) => {
		return filename.split('.')[1]
	}

	return mediaArray.map((value) => {
		return {
			name: value.name,
			remotePath: remotePath,
			localPath: localPath,
			device: this.btName,
			format: formatHandler(value.name),
			ctime: moment(new Date()).format('YYYY-MM-DDTHH-mm-ss'),
			mtime: value.time,
			size: value.size,
			patientInfo: {}
		}
	})
}

// FtpFileHandler.prototype.get = function(remotepath, localpath) {
// 	return
// }

module.exports = FtpFileHandler