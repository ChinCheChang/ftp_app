'use strict'

function Worker(tasksHander, replaceLogic, logger) {
	this.working = false 
	this.queue = []
	this.tasksHander = tasksHander
	this.replaceLogic = replaceLogic
	this.logger = logger
}

Worker.prototype.start = function() {
	this.working = true
	this.next()
}

Worker.prototype.next = function() {
	if (this.queue.length > 0) {
		let task = this.queue.pop();

		if ( this.logger ) { this.logger.info(`Start ${task.description}`) }

		this.tasksHander[task.name](task.parameters)
			.then(res => {
				this.next()
				return "finish";
			})
			.catch(err => {
				this.next()	
			})				
	} else {
		this.pause()
	}
}

Worker.prototype.pause = function() {
	this.working = false
}

Worker.prototype.cleanQueue = function() {
	this.queue = []
}

Worker.prototype.push = function(task) {	
	if ( this.replaceLogic ) this.replaceTaskInQueue(task) 
	this.queue.push(task)
	if ( !this.working ) this.start()
}

Worker.prototype.replaceTaskInQueue = function(task) {
	let index = this.queue.findIndex((value) => {
		return replaceLogic(value, task)
	})
	if ( index !== -1 ) this.queue.splice(index, 1) 
}

module.exports = Worker;
