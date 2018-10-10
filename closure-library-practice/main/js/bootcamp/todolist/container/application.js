goog.provide('wap.bootcamp.todolist.container.Application');

goog.require('goog.Promise');
goog.require('goog.dom.DomHelper');
goog.require('goog.events');
goog.require('goog.promise.Resolver');
goog.require('goog.ui.Component');
goog.require('wap.bootcamp.common.event.AsynchronousTrialEvent');
goog.require('wap.bootcamp.common.ui.SelectableListPlugin');
goog.require('wap.bootcamp.todolist.container.ProjectList');
goog.require('wap.bootcamp.todolist.container.TaskList');


/**
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.ui.Component}
 */
wap.bootcamp.todolist.container.Application = function(opt_domHelper) {
  goog.base(this, opt_domHelper);

  /**
   * @type {wap.bootcamp.todolist.container.ProjectList}
   * @private
   */
  this.projectList_;

  /**
   * @type {wap.bootcamp.todolist.container.TaskList}
   * @private
   */
  this.taskList_;

  this.buildComponents_();
};
goog.inherits(wap.bootcamp.todolist.container.Application, goog.ui.Component);


/** @enum {string} */
wap.bootcamp.todolist.container.Application.EventType = {
  REQUIRE_TASKS: goog.events.getUniqueId('require-tasks')
};


/** @type {string} */
wap.bootcamp.todolist.container.Application.CSS_CLASS = goog.getCssName('todo-application');


/** @private */
wap.bootcamp.todolist.container.Application.prototype.buildComponents_ = function() {
  this.projectList_ = new wap.bootcamp.todolist.container.ProjectList();
  this.addChild(this.projectList_);

  this.taskList_ = new wap.bootcamp.todolist.container.TaskList();
  this.addChild(this.taskList_);
};


/** @private */
wap.bootcamp.todolist.container.Application.prototype.discardComponents_ = function() {
  this.removeChildren();
  this.projectList_ = null;
  this.taskList_ = null;
};


/** @override */
wap.bootcamp.todolist.container.Application.prototype.canDecorate = function($element) {
  var $projectList = this.findProjectListElement_($element);
  var $taskList = this.findTaskListElement_($element);
  return (
      goog.base(this, 'canDecorate', $element) &&
      Boolean($projectList) &&
      this.projectList_.canDecorate($projectList) &&
      Boolean($taskList) &&
      this.taskList_.canDecorate($taskList)
  );
};


/**
 * @param {Element} $element
 * @return {Element}
 * @private
 */
wap.bootcamp.todolist.container.Application.prototype.findProjectListElement_ = function($element) {
  return this.getDomHelper().getElementByClass(wap.bootcamp.todolist.container.ProjectList.CSS_CLASS, $element);
};


/**
 * @param {Element} $element
 * @return {Element}
 * @private
 */
wap.bootcamp.todolist.container.Application.prototype.findTaskListElement_ = function($element) {
  return this.getDomHelper().getElementByClass(wap.bootcamp.todolist.container.TaskList.CSS_CLASS, $element);
};


/** @override */
wap.bootcamp.todolist.container.Application.prototype.decorateInternal = function($element) {
  goog.base(this, 'decorateInternal', $element);

  this.projectList_.decorate(this.findProjectListElement_($element));
  this.taskList_.decorate(this.findTaskListElement_($element));
};


/** @override */
wap.bootcamp.todolist.container.Application.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  this.discardComponents_();
};


/** @override */
wap.bootcamp.todolist.container.Application.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.getHandler().listen(
      this.projectList_,
      wap.bootcamp.common.ui.SelectableListPlugin.EventType.ITEM_SELECT,
      this.trySelectProject_
  );
};


/**
 * @param {wap.bootcamp.todolist.dto.Project} project
 * @return {wap.bootcamp.common.ui.ListItem} created list item
 */
wap.bootcamp.todolist.container.Application.prototype.addProject = function(project) {
  return this.projectList_.addProject(project);
};


/**
 * @param {!Array.<wap.bootcamp.todolist.dto.Project>} projects
 * @return {Array.<wap.bootcamp.common.ui.ListItem>} created list items
 */
wap.bootcamp.todolist.container.Application.prototype.addProjects = function(projects) {
  return this.projectList_.addProjects(projects);
};


/**
 * @param {wap.bootcamp.common.ui.SelectableListPlugin.ItemSelectEvent} event
 * @private
 */
wap.bootcamp.todolist.container.Application.prototype.trySelectProject_ = function(event) {
  var noneIsSelected = !(event.target instanceof wap.bootcamp.common.ui.ListItem);
  if (noneIsSelected) {
    this.taskList_.setProject(null);
    return;
  }

  var listItem = /** @type {wap.bootcamp.common.ui.ListItem} */(event.target);
  var project = {
    id: Number(this.projectList_.getProjectIdFrom(listItem)),
    title: listItem.getCaption()
  };
  this.taskList_.setProject(project);

  /** @type {goog.promise.Resolver.<Array.<wap.bootcamp.todolist.dto.Task>>} */
  var trial = goog.Promise.withResolver();
  trial.promise
      .then(function(tasks) {
        this.taskList_.addTasks(tasks);
      }.bind(this))
      .thenCatch(function(error) {
        alert(error);
      });
  this.dispatchEvent(new wap.bootcamp.common.event.AsynchronousTrialEvent(
      wap.bootcamp.todolist.container.Application.EventType.REQUIRE_TASKS, trial, project.id));
};
