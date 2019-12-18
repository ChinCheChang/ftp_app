'use strict'

const ftp = require("./ftp.js");

let queue = [];
let lastRequestTime = 0
let lastResponseTime = 0
let timeoutHandler = null
let timerId = null

const actions = {
	start: function(btName) {
		console.log('FTP worker start', btName)
		ftp.init(btName)
			.then( data => {this.next()})
			.catch(err => {console.log(err)})         
	},
	checkTimeout: function(millis) {
		let self = this
		timerId = setTimeout(() => {
			console.log('******************** FTP checkTimeout: ' + lastRequestTime + " vs " + lastResponseTime)
			if (lastResponseTime < lastRequestTime) {
				if (timeoutHandler) timeoutHandler()
			}
		}, 15000)
	},
	next: function() {
		if (queue.length > 0) {
			let task = queue.pop();
			//let params = task.parameters
			//timeoutHandler = params[params.length - 2]
			//lastRequestTime = Date.now()

			ftp[task.name](task.parameters)
				.then(res => {
					//this.handleResponse()
					this.next()
					return "finish";
				})
				.catch(err => {
					//this.handleResponse()
					this.next()	
				})				
			//this.checkTimeout()
		} else {
			//console.log("queue is empty")
			setTimeout(() => {
				this.next()
			}, 2000)
		}
	},
	push: function(task) {
		for (var i = 0; i < queue.length; i++) {
			let t = queue[i]
			if (t.name == task.name && t.parameters[0] == task.parameters[0]) {
				queue.splice(i, 1)
				break
			}
		}
		queue.push(task)
	},
	handleResponse: function() {
		console.log('******************** FTP checkTimeout: ' + lastRequestTime + " vs " + lastResponseTime)
		lastResponseTime = Date.now()
		if (timerId) {
			clearTimeout(timerId)
			timerId = null
		}
	}
}

module.exports = actions;
