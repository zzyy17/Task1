goog.provide('wap.bootcamp.todolist.dao.ProjectDao');

goog.require('goog.Promise');
goog.require('wap.bootcamp.todolist.dto.Project');


/**
 * @interface
 */
wap.bootcamp.todolist.dao.ProjectDao = function() {
};


/**
 * @param {wap.bootcamp.todolist.dto.Project} project
 * @return {!goog.Promise.<!wap.bootcamp.todolist.dto.Project>}
 */
wap.bootcamp.todolist.dao.ProjectDao.prototype.create;


/**
 * @param {number} id
 * @return {!goog.Promise.<!wap.bootcamp.todolist.dto.Project>}
 */
wap.bootcamp.todolist.dao.ProjectDao.prototype.remove;


/**
 * @return {!goog.Promise.<!Array.<!wap.bootcamp.todolist.dto.Project>>}
 */
wap.bootcamp.todolist.dao.ProjectDao.prototype.fetchAll;


/**
 * @param {!string} title
 * @return {!goog.Promise.<Array.<wap.bootcamp.todolist.dto.Project>>}
 */
wap.bootcamp.todolist.dao.ProjectDao.prototype.fetchByTitle;


/**
 * @param {wap.bootcamp.todolist.dto.Project} project
 * @return {!goog.Promise.<!wap.bootcamp.todolist.dto.Project>}
 */
wap.bootcamp.todolist.dao.ProjectDao.prototype.validate;
