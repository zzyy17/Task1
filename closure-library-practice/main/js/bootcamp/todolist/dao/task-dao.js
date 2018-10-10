goog.provide('wap.bootcamp.todolist.dao.TaskDao');

goog.require('goog.Promise');
goog.require('wap.bootcamp.todolist.dto.Task');


/**
 * @interface
 */
wap.bootcamp.todolist.dao.TaskDao = function() {
};


/**
 * @param {wap.bootcamp.todolist.dto.Task} task
 * @return {!goog.Promise.<wap.bootcamp.todolist.dto.Task>}
 */
wap.bootcamp.todolist.dao.TaskDao.prototype.create;


/**
 * @param {Object} task
 * @return {!goog.Promise.<wap.bootcamp.todolist.dto.Task>}
 */
wap.bootcamp.todolist.dao.TaskDao.prototype.update;


/**
 * @param {number} id
 * @return {!goog.Promise.<wap.bootcamp.todolist.dto.Task>}
 */
wap.bootcamp.todolist.dao.TaskDao.prototype.remove;


/**
 * @param {number} projectId
 * @return {!goog.Promise.<Array.<wap.bootcamp.todolist.dto.Task>>}
 */
wap.bootcamp.todolist.dao.TaskDao.prototype.fetchByProjectId;


/**
 * @param {wap.bootcamp.todolist.dto.Task} task
 * @return {!goog.Promise.<!wap.bootcamp.todolist.dto.Task>}
 */
wap.bootcamp.todolist.dao.TaskDao.prototype.validate;
