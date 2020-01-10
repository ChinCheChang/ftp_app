'use strict'

/**
 * 
 * @param {*} tasksHander 
 * @param {*} replaceLogic 
 * @param {*} options
 */
function Worker(tasksHander, replaceLogic, options) {
	this.working = false 
	this.queue = []
	this.tasksHander = tasksHander
	this.replaceLogic = replaceLogic
	this.logger = options.logger | null
	this.retry = options.retry | 3
	this.retryInterval = options.retryInterval | 0
	this.retryCounter = 0
}

Worker.prototype.start = function() {
	this.working = true
	this.next()
}

Worker.prototype.next = function() {
	if (this.queue.length > 0) {
		let task = this.queue[0];
		if ( this.logger ) { this.logger.info(`Start ${task.description}`) }

		this.tasksHander[task.name](task.parameters)
			.then(res => {
				this.queue.pop()
				this.retryCounter = 0
				this.next()
				return "finish";
			})
			.catch(err => {		
				this.retryCounter++
				if (!(this.retryCounter < this.retry)) {
					this.queue.pop()
					this.retryCounter = 0
				}
				setTimeout(() => {
					this.next()
				}, this.retryInterval)					
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
	//It would excute two times if one task is already excute
	if ( this.replaceLogic ) this.replaceTaskInQueue(task) 
	this.queue.push(task)
	if ( !this.working ) this.start()
}

Worker.prototype.replaceTaskInQueue = function(task) {
	let index = this.queue.findIndex((value) => {
		return this.replaceLogic(value, task)
	})
	if ( index !== -1 ) this.queue.splice(index, 1) 
}

module.exports = Worker;
