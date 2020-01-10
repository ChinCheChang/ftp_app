'use strict'

const EventEmitter = require('events');
// const fs = require('fs');
// const fsPromises = fs.promises;
// const homedir = require('os').homedir().replace(/\\/g, '\/');
// var localList = {}

class Promise_ftp extends EventEmitter {
	constructor(FtpObj, logger) {
		super(FtpObj, logger)
		this.FtpObj = FtpObj
		this.logger = logger  

		this.FtpObj.on('data', (data) => {
			this.emit('data', data)
		})
	}

	list({ path, failed, succeed }) {
		return new Promise ((resolve, reject) => {
			this.on('data', (data) => { console.log('list', data) })
			this.FtpObj.ls(path, (err, res) => {
				if (err) {
					this.logger.log({
						level: 'error',
						message: `[list] failed ${path}: ${err}`
					})
					failed(err)
					reject(err)
				} else {
					this.logger.log({					
						message: `[list] succeed ${path}`,
						level: 'info'
					})				
					succeed(res);
					resolve(res)
				}
			})
		})      
	}
}

// Promise_ftp.prototype.get = function({media, failed, succeed}) {
// 	let { remotePath, name, localPath } = media
// 	return new Promise ((resolve, reject) => {
// 		this.FtpObj.get( `${remotePath}/${name}`, localPath, () => {
// 			if (err) {
// 				this.logger.log({
// 					level: 'error',
// 					message: `[get] failed ${remotePath}: ${err}`
// 				})
// 				failed(err)
// 				reject(err)             
// 			} else {
// 				succeed(res)
// 				resolve(res)            
// 			}
// 		})
// 	})
// }
 

module.exports = Promise_ftp;
