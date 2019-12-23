'use strict'

const fs = require('fs');
// const fsPromises = fs.promises;
// const homedir = require('os').homedir().replace(/\\/g, '\/');
// var localList = {}

function Promise_ftp(FtpObj, logger) {
		this.FtpObj = FtpObj
		this.logger = logger    
}

Promise_ftp.prototype.list = function({path, failed, succeed }) {
	return new Promise ((resolve, reject) => {
		this.FtpObj.ls(path, (err, res) => {
			if (err) {
				this.logger.log({
					level: 'error',
					message: `[listAll] failed ${path}: ${err}`
				})
				failed(err)
				reject(err)
			} else {
				this.logger.log({					
					message: `[listAll] succeed ${path}`,
					level: 'info'
				})				
				succeed(res);
				resolve(res)
			}
		})
	})        
}

 

module.exports = Promise_ftp;
