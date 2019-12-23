'use strict'

const fs = require('fs');
// const fsPromises = fs.promises;
// const homedir = require('os').homedir().replace(/\\/g, '\/');
// var localList = {}

function Promise_ftp(FtpObj, logger) {
		this.FtpObj = FtpObj
		this.logger = logger    
}

Promise_ftp.prototype.listAll = function(args) {
	return new Promise ((resolve, reject) => {
		this.FtpObj.ls(args[0], (err, res) => {
			if (err) {
				this.logger.log({
					level: 'error',
					message: `[listAll] failed ${args[0]}`
				})
				reject(err)
			} else {
				this.logger.log({					
					message: `[listAll] succeed ${args[0]}`,
					level: 'info'
				})				
				args[args.length - 1](res);
				resolve(res)
			}
		})
	})        
}

 

module.exports = Promise_ftp;
