'use strict'

const fs = require('fs');
// const fsPromises = fs.promises;
// const homedir = require('os').homedir().replace(/\\/g, '\/');
// var localList = {}

function Promise_ftp(FtpObj) {
    this.FtpObj = FtpObj    
}

Promise_ftp.prototype.listAll = function(args) {
	return new Promise ((resolve, reject) => {
		this.FtpObj.ls(args[0], (err, res) => {
			if (err) {
				console.log("FTP: List Ftp file name error", err)
				reject(err)
			}

			args[args.length - 1](res);
			resolve(res)
		})
	})        
}

 

module.exports = Promise_ftp;
