goog.provide('wap.bootcamp.todolist.TodolistApp');

goog.require('goog.events');
goog.require('wap.bootcamp.common.event.AsynchronousTrialEvent');
goog.require('wap.bootcamp.common.logic.promise');
goog.require('wap.bootcamp.todolist.container.Application');
goog.require('wap.bootcamp.todolist.container.ProjectList');
goog.require('wap.bootcamp.todolist.container.TaskList');
goog.require('wap.bootcamp.todolist.dao.ProjectDao');
goog.require('wap.bootcamp.todolist.dao.TaskDao');
goog.require('wap.bootcamp.todolist.dto.Project');
goog.require('wap.bootcamp.todolist.dto.Task');


/**
 * Controller for To-Do List application.
 * @constructor
 * @param {wap.bootcamp.todolist.container.Application} application
 * @param {!{
 *   projectDao: wap.bootcamp.todolist.dao.ProjectDao,
 *   taskDao: wap.bootcamp.todolist.dao.TaskDao
 * }} daos
 */
wap.bootcamp.todolist.TodolistApp = function(application, daos) {
  this.application_ = application;
  this.daos_ = daos;

  this.bindEvents_();
  this.initialize_();
};


/**
 * @private
 */
wap.bootcamp.todolist.TodolistApp.prototype.bindEvents_ = function() {
  goog.events.listen(
      this.application_,
      wap.bootcamp.todolist.container.ProjectList.EventType.CREATE_PROJECT,
      this.createProject_,
      false,
      this
  );
  goog.events.listen(
      this.application_,
      wap.bootcamp.todolist.container.ProjectList.EventType.DELETE_PROJECT,
      this.deleteProject_,
      false,
      this
  );
  goog.events.listen(
      this.application_,
      wap.bootcamp.todolist.container.Application.EventType.REQUIRE_TASKS,
      this.requireTasks_,
      false,
      this
  );
  goog.events.listen(
      this.application_,
      wap.bootcamp.todolist.container.TaskList.EventType.CREATE_TASK,
      this.createTask_,
      false,
      this
  );
  goog.events.listen(
      this.application_,
      wap.bootcamp.todolist.container.TaskList.EventType.UPDATE_TASK,
      this.updateTask_,
      false,
      this
  );
  goog.events.listen(
      this.application_,
      wap.bootcamp.todolist.container.ProjectList.EventType.VALIDATE_PROJECT,
      this.validateProject_,
      false,
      this
  );
  goog.events.listen(
      this.application_,
      wap.bootcamp.todolist.container.TaskList.EventType.VALIDATE_TASK,
      this.validateTask_,
      false,
      this
  );
};


/**
 * @param {wap.bootcamp.common.event.AsynchronousTrialEvent.<
 *   wap.bootcamp.todolist.dto.Project, wap.bootcamp.todolist.dto.Project>} event
 * @private
 */
wap.bootcamp.todolist.TodolistApp.prototype.createProject_ = function(event) {
  event.preventDefault();
  var project = /** @type {wap.bootcamp.todolist.dto.Project} */(event.target);
  wap.bootcamp.common.logic.promise.redirect(
      this.daos_.projectDao.create(project),
      event.trial
  );
};


/**
 * @param {wap.bootcamp.common.event.AsynchronousTrialEvent.<number, wap.bootcamp.todolist.dto.Project>} event
 * @private
 */
wap.bootcamp.todolist.TodolistApp.prototype.deleteProject_ = function(event) {
  event.preventDefault();
  var projectId = Number(event.target);
  wap.bootcamp.common.logic.promise.redirect(
      this.daos_.projectDao.remove(projectId),
      event.trial
  );
};


/**
 * @param {wap.bootcamp.common.event.AsynchronousTrialEvent.<number, Array.<wap.bootcamp.todolist.dto.Task>>} event
 * @private
 */
wap.bootcamp.todolist.TodolistApp.prototype.requireTasks_ = function(event) {
  event.preventDefault();
  var projectId = Number(event.target);
  wap.bootcamp.common.logic.promise.redirect(
      this.daos_.taskDao.fetchByProjectId(projectId),
      event.trial
  );
};


/**
 * @param {wap.bootcamp.common.event.AsynchronousTrialEvent.<wap.bootcamp.todolist.dto.Task,
 *   wap.bootcamp.todolist.dto.Task>} event
 * @private
 */
wap.bootcamp.todolist.TodolistApp.prototype.createTask_ = function(event) {
  event.preventDefault();
  var task = /** @type {!wap.bootcamp.todolist.dto.Task} */(event.target);
  wap.bootcamp.common.logic.promise.redirect(
      this.daos_.taskDao.create(task),
      event.trial
  );
};


/**
 * @param {wap.bootcamp.common.event.AsynchronousTrialEvent.<Object, wap.bootcamp.todolist.dto.Task>} event
 * @private
 */
wap.bootcamp.todolist.TodolistApp.prototype.updateTask_ = function(event) {
  event.preventDefault();
  var task = /** @type {!wap.bootcamp.todolist.dto.Task} */(event.target);
  wap.bootcamp.common.logic.promise.redirect(
      this.daos_.taskDao.update(task),
      event.trial
  );
};


/**
 * @private
 */
wap.bootcamp.todolist.TodolistApp.prototype.initialize_ = function() {
  this.loadAllProjects_();
};


/**
 * @private
 */
wap.bootcamp.todolist.TodolistApp.prototype.loadAllProjects_ = function() {
  this.daos_.projectDao
      .fetchAll()
      .then(function(projects) {
        this.application_.addProjects(projects);
      }.bind(this))
      .thenCatch(function() {
        alert('Failed to load projects');
      }.bind(this));
};

/**
 * @param {wap.bootcamp.common.event.AsynchronousTrialEvent.<wap.bootcamp.todolist.dto.Project,
 *   wap.bootcamp.todolist.dto.Project>} event
 * @private
 */
wap.bootcamp.todolist.TodolistApp.prototype.validateProject_ = function(event) {
  event.preventDefault();
  var project = /** @type {wap.bootcamp.todolist.dto.Project} */(event.target);
  var trial = event.trial;
  wap.bootcamp.common.logic.promise.redirect(
      this.daos_.projectDao.validate(project),
      trial
  );
};

/**
 * @param {wap.bootcamp.common.event.AsynchronousTrialEvent.<wap.bootcamp.todolist.dto.Task,
 *   wap.bootcamp.todolist.dto.Task>} event
 * @private
 */
wap.bootcamp.todolist.TodolistApp.prototype.validateTask_ = function(event) {
  event.preventDefault();
  var task = /** @type {!wap.bootcamp.todolist.dto.Task} */(event.target);
  var trial = event.trial;
  wap.bootcamp.common.logic.promise.redirect(
      this.daos_.taskDao.validate(task),
      trial
  );
};
