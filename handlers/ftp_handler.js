'use strict'

const moment = require('moment')

function Ftp_handler(db, logger) {
	this.db = db
	this.logger = logger
}

Ftp_handler.prototype.listSucceed = function(res, path) {
	res.map((value) => {
		this.checkMedia(value.name)
			.then((res) => {
				if (!res) {
					this.db.insert(this.mediaCreater(value, path), function(err, newDoc) {
						if (err) throw err
						console.log('Add new file', newDoc)
					})
				}
			})
			.catch(err => {
				this.logger.log({
					level: 'error',
					message: `db find error name: ${err}`
				})
			})				
	})
}

Ftp_handler.prototype.mediaCreater = function( media, remotePath, localPath = null ) {
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

Ftp_handler.prototype.checkMedia = function(mediaName) {
	return new Promise((resolve, reject) => {
		this.db.find({ name: mediaName }, function (err, docs) {
			if (err) { reject(err) }
			docs.length > 0 ? resolve(true) : resolve(false)
		})
	})
}




module.exports = Ftp_handler