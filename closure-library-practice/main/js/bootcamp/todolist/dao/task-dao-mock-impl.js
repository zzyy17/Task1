goog.provide('wap.bootcamp.todolist.dao.TaskDaoMockImpl');

goog.require('goog.Promise');
goog.require('goog.string.format');
goog.require('wap.bootcamp.todolist.dao.TaskDao');
goog.require('wap.bootcamp.todolist.dto.Task');


/**
 * @param {Array.<wap.bootcamp.todolist.dto.Task>=} opt_mockData initial mock data
 * @param {number=} opt_delay simulative delay milliseconds for data access
 * @constructor
 * @implements {wap.bootcamp.todolist.dao.TaskDao}
 */
wap.bootcamp.todolist.dao.TaskDaoMockImpl = function(opt_mockData, opt_delay) {
  /**
   * @type {Array.<wap.bootcamp.todolist.dto.Task>}
   * @private
   */
  this.data_ = opt_mockData ? goog.array.clone(opt_mockData) : [];

  /**
   * @type {number}
   * @private
   */
  this.nextId_ = this.data_
    .map(function(task) {
      return task.id;
    })
    .reduce(function(x, y) {
      return Math.max(x, y);
    }, 0) + 1;

  /**
   * @type {number}
   * @private
   */
  this.delay_ = opt_delay || 0;


  /**
   * @type {Array.<wap.bootcamp.todolist.dao.TaskDaoMockImpl.TaskValidator_>}
   * @private
   */
  this.validators_ = [
    new wap.bootcamp.todolist.dao.TaskDaoMockImpl.TitleValidator_()
  ];
};


/** @override */
wap.bootcamp.todolist.dao.TaskDaoMockImpl.prototype.create = function(task) {
  return (this
      .validate(task)
      .then(function() {
        var newTask = {
          id: this.nextId_++,
          title: task.title,
          projectId: task.projectId,
          done: task.done
        };
        this.data_.push(newTask);
        return newTask;
      }.bind(this))
  );
};


/** @override */
wap.bootcamp.todolist.dao.TaskDaoMockImpl.prototype.update = function(task) {
  return (this
      .validate(/** @type {wap.bootcamp.todolist.dto.Task} */ (task))
      .then(function() {
        var index = goog.array.findIndex(this.data_, function(t) {
          return t.id === task.id;
        });
        if (index < 0) {
          return goog.Promise.reject('No task registered - ID = ' + task.id);
        }
        var projectId = task.projectId || this.data_[index];
        var duplicated = Boolean(task.title) && goog.array.some(this.data_, function(t) {
          return (t.projectId === projectId) && (t.id !== task.id) && (t.title === task.title);
        });
        if (duplicated) {
          return goog.Promise.reject('Task "' + task.title + '" is already registered');
        } else {
          this.updateData_(task, index);
          return this.data_[index];
        }
      }.bind(this))
  );
};


/**
 * @param {Object} src
 * @param {number} targetIndex
 * @private
 */
wap.bootcamp.todolist.dao.TaskDaoMockImpl.prototype.updateData_ = function(src, targetIndex) {
  if (src.title !== (void 0)) {
    this.data_[targetIndex].title = src.title;
  }
  if (src.projectId !== (void 0)) {
    this.data_[targetIndex].projectId = src.projectId;
  }
  if (src.done !== (void 0)) {
    this.data_[targetIndex].done = src.done;
  }
};


/** @override */
wap.bootcamp.todolist.dao.TaskDaoMockImpl.prototype.remove = function(id) {
  return new goog.Promise(function(resolve, reject) {
    setTimeout(function() {
      var i = goog.array.findIndex(this.data_, function(p) {
        return p.id === id;
      });
      if (i > -1) {
        resolve(this.data_.splice(i, 1)[0]);
      } else {
        reject('Task not found: id = ' + id);
      }
    }.bind(this), this.delay_);
  }, this);
};


/** @override */
wap.bootcamp.todolist.dao.TaskDaoMockImpl.prototype.fetchByProjectId = function(projectId) {
  return new goog.Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve(goog.array.filter(this.data_, function(task) {
        return task.projectId === projectId;
      }));
    }.bind(this), this.delay_);
  }, this);
};


/** @override */
wap.bootcamp.todolist.dao.TaskDaoMockImpl.prototype.validate = function(task) {
  return new goog.Promise(function(resolve, reject) {
    setTimeout(function() {
      var errors = goog.array.flatten(goog.array.map(this.validators_, function(validator) {
        return validator.validate(task, this.data_ || []);
      }, this));
      if (goog.array.isEmpty(errors)) {
        resolve(task);
      } else {
        reject(errors.join('; '));
      }
    }.bind(this), this.delay_);
  }, this);
};


/**
 * @interface
 * @private
 */
wap.bootcamp.todolist.dao.TaskDaoMockImpl.TaskValidator_ = function() {
};


/**
 * @param {wap.bootcamp.todolist.dto.Task} task
 * @param {!Array.<wap.bootcamp.todolist.dto.Task>} tasks
 * @return {!Array.<string|Error>} errors if any, empty array if the title is valid.
 */
wap.bootcamp.todolist.dao.TaskDaoMockImpl.TaskValidator_.prototype.validate;


/**
 * @constructor
 * @private
 * @implements {wap.bootcamp.todolist.dao.TaskDaoMockImpl.TaskValidator_}
 */
wap.bootcamp.todolist.dao.TaskDaoMockImpl.TitleValidator_ = function() {
};


/** @override */
wap.bootcamp.todolist.dao.TaskDaoMockImpl.TitleValidator_.prototype.validate = function(task, tasks) {
  if (!task) {
    return ['Task must not be null'];
  }
  if (!task.title || goog.string.isEmpty(task.title)) {
    return ['Task title must not be emptry'];
  }
  var target = goog.object.clone(task);
  if (!target.projectId) {
    var searched = goog.array.find(tasks, function(t) {
      return task.id === target.id;
    });
    if (!searched) {
      return [goog.string.format('Specify valid task id or project id: task id = %s, project id = %s',
        task.id, task.projectId)];
    }
    target.projectId = searched.projectId;
  }
  var duplicated = goog.array.some(tasks, function(t) {
    return (target.title === t.title) && (target.projectId === t.projectId) && (target.id !== t.id);
  });
  if (duplicated) {
    return [goog.string.format('Task "%s" is already registered', task.title)];
  }
  return [];
};
