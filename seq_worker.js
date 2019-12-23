'use strict'

function Worker(tasksHander, replaceLogic) {
	this.working = false 
	this.queue = []
	this.tasksHander = tasksHander
	this.replaceLogic = replaceLogic
}

Worker.prototype.start = function() {
	this.working = true
	this.next()
}

Worker.prototype.next = function() {
	if (queue.length > 0) {
		let task = queue.pop();

		tasksHander[task.name](task.parameters)
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
	if ( replaceLogic ) this.replaceTaskInQueue(task) 
	queue.push(task)
	if ( !this.working ) this.start()
}

Worker.prototype.replaceTaskInQueue = function(task) {
	let index = this.queue.findIndex((value) => {
		return replaceLogic(value, task)
	})
	if ( index !== -1 ) this.queue.splice(index, 1) 
}

module.exports = Worker;
