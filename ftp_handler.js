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

FtpFileHandler.prototype.mediaCreater = function( media, remotePath, localPath = null ) {
	let formatHandler = (filename) => {	return filename.split('.')[1]	}

	return {
		name: media.name,
		remotePath: remotePath,
		localPath: localPath,
		device: this.btName,
		format: formatHandler(media.name),
		ctime: moment(new Date()).format('YYYY-MM-DDTHH-mm-ss'),
		mtime: media.time,
		size: media.size,
		patientInfo: {}
	}
}

FtpFileHandler.prototype.list = function(path) {		
	// Check media exist or not by file name
	let checkMedia = (mediaName) => {
		return new Promise((resolve, reject) => {
			this.db.find({ name: mediaName }, function (err, docs) {
				if (err) { reject(err) }
				docs.length > 0 ? resolve(true) : resolve(false)
			})
		})
	}
	
	this.Worker.push({
		name: "list",
		parameters: {
			path, 
			failed: (error) => {	console.log( error ) }, 
			succeed: (res) => {
				res.map((value) => {
					checkMedia(value.name)
						.then((res) => {
							if (!res) this.db.insert(this.mediaCreater(value, path))
						})
						.catch(err => {
							this.logger.log({
							level: 'error',
							message: `db find error name: ${err}`
				})
						})				
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