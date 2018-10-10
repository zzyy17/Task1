goog.provide('wap.bootcamp.todolist.dao.ProjectDaoMockImpl');

goog.require('goog.Promise');
goog.require('goog.string.format');
goog.require('wap.bootcamp.todolist.dao.ProjectDao');
goog.require('wap.bootcamp.todolist.dto.Project');


/**
 * @param {Array.<!wap.bootcamp.todolist.dto.Project>=} opt_mockData initial mock data
 * @param {number=} opt_delay simulative delay milliseconds for data access
 * @constructor
 * @implements {wap.bootcamp.todolist.dao.ProjectDao}
 */
wap.bootcamp.todolist.dao.ProjectDaoMockImpl = function(opt_mockData, opt_delay) {
  /**
   * @type {Array.<!wap.bootcamp.todolist.dto.Project>}
   * @private
   */
  this.data_ = opt_mockData ? goog.array.clone(opt_mockData) : [];

  /**
   * @type {number}
   * @private
   */
  this.nextId_ = this.data_
    .map(function(project) {
      return project.id;
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
   * @type {Array.<wap.bootcamp.todolist.dao.ProjectDaoMockImpl.ProjectValidator_>}
   * @private
   */
  this.validators_ = [
    new wap.bootcamp.todolist.dao.ProjectDaoMockImpl.TitleValidator_()
  ];
};


/** @override */
wap.bootcamp.todolist.dao.ProjectDaoMockImpl.prototype.create = function(project) {
  return (this
      .validate(project)
      .then(function() {
        var newProject = {
          id: this.nextId_++,
          title: project.title
        };
        this.data_.push(newProject);
        return newProject;
      }.bind(this))
  );
};


/** @override */
wap.bootcamp.todolist.dao.ProjectDaoMockImpl.prototype.remove = function(id) {
  return new goog.Promise(function(resolve, reject) {
    setTimeout(function() {
      var i = goog.array.findIndex(this.data_, function(p) {
        return p.id === id;
      });
      if (i > -1) {
        resolve(this.data_.splice(i, 1)[0]);
      } else {
        reject('Project not found: id = ' + id);
      }
    }.bind(this), this.delay_);
  }, this);
};


/** @override */
wap.bootcamp.todolist.dao.ProjectDaoMockImpl.prototype.fetchAll = function() {
  return new goog.Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve(goog.array.clone(this.data_));
    }.bind(this), this.delay_);
  }, this);
};


/** @override */
wap.bootcamp.todolist.dao.ProjectDaoMockImpl.prototype.fetchByTitle = function(title) {
  return new goog.Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve(this.data_.filter(function(data) {
        return data.title === title;
      }));
    }.bind(this), this.delay_);
  }, this);
};


/** @override */
wap.bootcamp.todolist.dao.ProjectDaoMockImpl.prototype.validate = function(project) {
  return new goog.Promise(function(resolve, reject) {
    setTimeout(function() {
      var errors = goog.array.flatten(goog.array.map(this.validators_, function(validator) {
        return validator.validate(project, this.data_ || []);
      }, this));
      if (goog.array.isEmpty(errors)) {
        resolve(project);
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
wap.bootcamp.todolist.dao.ProjectDaoMockImpl.ProjectValidator_ = function() {
};


/**
 * @param {wap.bootcamp.todolist.dto.Project} project
 * @param {!Array.<wap.bootcamp.todolist.dto.Project>} projects
 * @return {!Array.<string|Error>} errors if any, empty array if the title is valid.
 */
wap.bootcamp.todolist.dao.ProjectDaoMockImpl.ProjectValidator_.prototype.validate;


/**
 * @constructor
 * @private
 * @implements {wap.bootcamp.todolist.dao.ProjectDaoMockImpl.ProjectValidator_}
 */
wap.bootcamp.todolist.dao.ProjectDaoMockImpl.TitleValidator_ = function() {
};


/** @override */
wap.bootcamp.todolist.dao.ProjectDaoMockImpl.TitleValidator_.prototype.validate = function(project, projects) {
  if (!project) {
    return ['Project must not be null'];
  }
  if (!project.title || goog.string.isEmpty(project.title)) {
    return ['Project title must not be empty'];
  }
  var duplicated = goog.array.some(projects, function(p) {
    return (project.title === p.title) && (project.id !== p.id);
  });
  if (duplicated) {
    return [goog.string.format('Project "%s" is already registered', project.title)];
  }
  return [];
};
