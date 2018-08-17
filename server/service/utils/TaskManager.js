function TaskManager() {
    this.tasks = {};
    this.intervalTasks = {};
}

TaskManager.prototype.addOnceTask = function (key, execute, timeout) {
    if (typeof execute !== "function") {
        throw new Error("Execute Must Be Type Function.");
    }
    if (this.tasks[key] !== undefined) {
        clearTimeout(this.tasks[key])
    }
    const that = this;
    const id = setTimeout(function () {
        delete  that.tasks[key];
        execute()
    }, timeout);
    this.tasks[key] = id;
}

TaskManager.prototype.addIntervalTask = function (key, execute, interval) {
    if (typeof execute !== "function") {
        throw new Error("Execute Must Be Type Function.");
    }
    if (this.intervalTasks[key] !== undefined) {
        clearInterval(this.intervalTasks[key])
    }
    this.intervalTasks[key] = setInterval(function () {
        execute()
    }, interval);
}

TaskManager.prototype.removeOnceTask = function (key) {
    if (this.tasks[key] !== undefined) {
        clearInterval(this.tasks[key])
        delete this.tasks[key];
    }
}
TaskManager.prototype.removeIntervalTask = function (key) {
    if (this.intervalTasks[key] !== undefined) {
        clearInterval(this.intervalTasks[key])
        delete this.intervalTasks[key];
    }
}

module.exports = TaskManager;

