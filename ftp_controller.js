'use strict'

const ftpWorker = require('./ftp_worker.js')
const fsPromises = require('fs').promises;
const ftp = require('./ftp.js')
let winRef = null

const actions = {
	ftpStart: function(win, btName) {
		winRef = win
		//this.showDebugMessage('ftpStart')
		ftpWorker.start(btName);	
	},
	getOneFile: function(fileInfo, win) {
		let self = this
		let successList = []
		let failedList = []

		let afterTaskDone = () => {	
			win.webContents.send(
				'ftpResp', 
				'get_one_file', 
				successList, 
				failedList
			)	
		}

		let pushToSuccessList = (fileInfo) => {
			console.log('FTP: getOneFile pushToSuccessList')	
			successList.push({ type: fileInfo.path.replace('./', ''), name: fileInfo.name})	
		}

		let pushToFailedList = (fileInfo) => { 
			console.log('FTP: getOneFile pushToFailedList')
			failedList.push({ type: fileInfo.path.replace('./', ''), name: fileInfo.name}) 
		}

		ftpWorker.push(
			self.taskDoneObj('get_one_file', afterTaskDone)
		)

		ftpWorker.push(
			self.getFileObj(
				'get_one_file',
				fileInfo,
				win,
				pushToSuccessList, 
				pushToFailedList
			)
		)
	},
	getAllFiles: function(fileList, btName, win) {
		let self = this
		self.showDebugMessage('getAllFiles...')
		let successList = []
		let failedList = []
		let afterTaskDone = () => {
			win.webContents.send('ftpResp', 'sync_finish', successList, failedList)	
		}

		ftpWorker.push(	self.taskDoneObj('get_all_file', afterTaskDone) )

		let pushToSuccessList = (fileInfo) => {	
			successList.push({ type: fileInfo.path.replace('./', ''), name: fileInfo.name})	
		}

		let pushToFailedList = (fileInfo) => { 
			failedList.push({ type: fileInfo.path.replace('./', ''), name: fileInfo.name}) 
		}

		fileList.map((value) => {
			let fileName = value.name
			let filePath = value.path
			if (value.name.indexOf('MP4') !== -1) {
				fileName = value.name.replace('MP4', 'JPG')
				filePath = './thumb'		
			} else if (value.name.indexOf('MOV') !== -1) {
				fileName = value.name.replace('MOV', 'JPG')
				filePath = './thumb'		
			}			
		
			ftpWorker.push(
				self.getFileObj(
					'getfile',
					{ name: fileName, path: filePath, btName, mtimeMs: value.time },
					win,
					pushToSuccessList, 
					pushToFailedList
				)
			)
		})
	},
	listAllFiles: function(path, array) {
		let self = this
		self.showDebugMessage('listAllFiles: ', path)
		return new Promise((resolve, reject) => {			
			ftpWorker.push({
				name: "listAll",
				parameters: [path, () => {
					self.showDebugMessage('listAllFiles failed: ', path)
					reject('error')
				}, (res = []) => {
					self.showDebugMessage('listAllFiles Success: ', path)
					let fileList = res.map((value) => {
						return {name: value.name, time: value.time, path: path, size: value.size}
					})					
					resolve(fileList);
				}],
				description: 'test'
			});							
		})
	},
	checkLocalFile: function(btName) {
		this.showDebugMessage('checkLocalFiles: ', btName)
		//No use
		return ftp.checkLocalFiles(btName)
	},
	deleteMediCamFiles: function(filePathList) {
		let self = this
		return Promise.all(
			filePathList.map((path) => {
				return new Promise ((resolve, reject) => {
					ftpWorker.push({
						name: "deleteFile",
						parameters: [path, () => {
							reject('error')
							self.showDebugMessage("deleteFile failed", path)
						}, (res = []) => { resolve(res); }]
						, description: 'delete medicam files'
					});	
				})
			})								
		)
	},
	showDebugMessage: function(msg, arg = null) {
		if (winRef) winRef.webContents.send('showFilesDebugText', msg)
		console.error("FTP: " + msg, arg)
	},
	taskDoneObj: function(description, afterDone) {
		let self = this
		return {
			name: "taskDone",
			parameters: [() => {
				// afterfailed()
				self.showDebugMessage(`${description} failed`)
			}, (res) => {
				afterDone()			
				self.showDebugMessage(`${description} success`)
			}],
			description: description
		};	
	},
	getFileObj: function(description, fileInfo, win, afterDone, afterFailed) {
		let self = this
		return {
			name: "getFile",
			parameters: [
				fileInfo,
				win ,
				() => {
					afterFailed(fileInfo)
					self.showDebugMessage(`${description} failed`)
				}, (res) => {	
					afterDone(fileInfo)	
					self.showDebugMessage(`${description} success`)
				}],
			description: description
		}
	},
	refreshLocalList: function(btName) {
		ftp.checkLocalFiles(btName)
	}
}

module.exports = actions;
