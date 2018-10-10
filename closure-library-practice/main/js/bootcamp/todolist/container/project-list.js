goog.provide('wap.bootcamp.todolist.container.ProjectList');


goog.require('goog.Promise');
goog.require('goog.dom');
goog.require('goog.dom.DomHelper');
goog.require('goog.events');
goog.require('goog.promise.Resolver');
goog.require('goog.ui.Component');
goog.require('goog.ui.Control');
goog.require('wap.bootcamp.common.event.AsynchronousTrialEvent');
goog.require('wap.bootcamp.common.logic.promise');
goog.require('wap.bootcamp.common.ui.DeletableListPlugin');
goog.require('wap.bootcamp.common.ui.List');
goog.require('wap.bootcamp.common.ui.ListItem');
goog.require('wap.bootcamp.common.ui.ListPlugin');
goog.require('wap.bootcamp.common.ui.SelectableListPlugin');
goog.require('wap.bootcamp.todolist.dto.Project');
goog.require('wap.bootcamp.todolist.dto.Task');
goog.require('wap.bootcamp.todolist.ui.Foldable');
goog.require('wap.bootcamp.todolist.ui.Registrar');
goog.require('wap.bootcamp.common.logic.promise');


/**
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.ui.Component}
 */
wap.bootcamp.todolist.container.ProjectList = function(opt_domHelper) {
  goog.base(this, opt_domHelper);

  /**
   * @type {wap.bootcamp.common.ui.List.<number>}
   * @private
   */
  this.list_;

  /**
   * @type {wap.bootcamp.todolist.ui.Foldable}
   * @private
   */
  this.foldable_;

  /**
   * @type {wap.bootcamp.todolist.ui.Registrar}
   * @private
   */
  this.registrar_;

  this.buildComponents_();
};
goog.inherits(wap.bootcamp.todolist.container.ProjectList, goog.ui.Component);


/** @type {string} */
wap.bootcamp.todolist.container.ProjectList.CSS_CLASS = goog.getCssName('project-list');


/** @enum {string} */
wap.bootcamp.todolist.container.ProjectList.EventType = {
  CREATE_PROJECT: goog.events.getUniqueId('create-project'),
  DELETE_PROJECT: goog.events.getUniqueId('delete-project'),
  VALIDATE_PROJECT: goog.events.getUniqueId('validate-project')
};


/** @private */
wap.bootcamp.todolist.container.ProjectList.prototype.buildComponents_ = function() {
  this.list_ = new wap.bootcamp.common.ui.List([
    wap.bootcamp.common.ui.DeletableListPlugin.getInstance(),
    wap.bootcamp.common.ui.SelectableListPlugin.getInstance()
  ]);
  this.addChild(this.list_);

  this.foldable_ = new wap.bootcamp.todolist.ui.Foldable();
  this.addChild(this.foldable_);

  this.registrar_ = new wap.bootcamp.todolist.ui.Registrar();
  this.addChild(this.registrar_);
};


/** @private */
wap.bootcamp.todolist.container.ProjectList.prototype.discardComponents_ = function() {
  this.removeChildren();
  this.list_ = null;
  this.foldable_ = null;
  this.registrar_ = null;
};


/** @override */
wap.bootcamp.todolist.container.ProjectList.prototype.canDecorate = function($element) {
  var $list = this.findListElement_($element);
  var $foldable = this.findFoldableElement_($element);
  var $registrar = this.findRegistrarElement_($element);
  return (
      goog.base(this, 'canDecorate', $element) &&
      Boolean($list) &&
      this.list_.canDecorate($list) &&
      Boolean($foldable) &&
      this.foldable_.canDecorate($foldable) &&
      Boolean($registrar) &&
      this.registrar_.canDecorate($registrar)
  );
};


/**
 * @param {Element} $element
 * @return {Element}
 * @private
 */
wap.bootcamp.todolist.container.ProjectList.prototype.findListElement_ = function($element) {
  return this.getDomHelper().getElementByClass(wap.bootcamp.common.ui.List.CSS_CLASS, $element);
};


/**
 * @param {Element} $element
 * @return {Element}
 * @private
 */
wap.bootcamp.todolist.container.ProjectList.prototype.findFoldableElement_ = function($element) {
  return this.getDomHelper().getElementByClass(wap.bootcamp.todolist.ui.Foldable.CSS_CLASS, $element);
};


/**
 * @param {Element} $element
 * @return {Element}
 * @private
 */
wap.bootcamp.todolist.container.ProjectList.prototype.findRegistrarElement_ = function($element) {
  return this.getDomHelper().getElementByClass(wap.bootcamp.todolist.ui.Registrar.CSS_CLASS, $element);
};


/** @override */
wap.bootcamp.todolist.container.ProjectList.prototype.decorateInternal = function($element) {
  goog.base(this, 'decorateInternal', $element);

  this.list_.decorate(this.findListElement_($element));
  this.foldable_.decorate(this.findFoldableElement_($element));
  this.registrar_.decorate(this.findRegistrarElement_($element));
};


/** @override */
wap.bootcamp.todolist.container.ProjectList.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  this.discardComponents_();
};


/** @override */
wap.bootcamp.todolist.container.ProjectList.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.getHandler().listen(
      this.registrar_,
      wap.bootcamp.todolist.ui.Registrar.EventType.ADD,
      this.tryAddProject_
  );
  this.getHandler().listen(
      this.list_,
      wap.bootcamp.common.ui.DeletableListPlugin.EventType.ITEM_DELETE,
      this.tryDeleteProject_
  );
  this.getHandler().listen(
      this.registrar_,
      wap.bootcamp.todolist.ui.Registrar.EventType.VALIDATE,
      this.validateProject_
  );
};


/**
 * @param {wap.bootcamp.todolist.ui.Registrar.AddEvent} event
 * @private
 */
wap.bootcamp.todolist.container.ProjectList.prototype.tryAddProject_ = function(event) {
  var trialProject = { title: event.text };
  /** @type {goog.promise.Resolver.<wap.bootcamp.todolist.dto.Project>} */
  var trial = goog.Promise.withResolver();
  trial.promise
      .then(function(savedProject) {
        this.list_.addItem({
          caption: savedProject.title,
          associatedData: savedProject.id
        });
      }.bind(this))
      .thenCatch(function(error) {
        alert(error);
      });

  var tryAddEvent = new wap.bootcamp.common.event.AsynchronousTrialEvent(
      wap.bootcamp.todolist.container.ProjectList.EventType.CREATE_PROJECT, trial, trialProject);
  this.dispatchEvent(tryAddEvent);
};


/**
 * @param {wap.bootcamp.common.ui.DeletableListPlugin.ItemDeleteEvent} event
 * @private
 */
wap.bootcamp.todolist.container.ProjectList.prototype.tryDeleteProject_ = function(event) {
  var listItem = /** @type {wap.bootcamp.common.ui.ListItem.<number>} */(event.target);
  var projectId = listItem.getAssociatedData();

  if (!confirm('Are you sure to delete project \'' + listItem.getCaption() + '\'?')) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  /** @type {goog.promise.Resolver.<number>} */
  var trial = goog.Promise.withResolver();
  trial.promise
      .thenCatch(function(error) {
        alert(error);
      });

  this.dispatchEvent(new wap.bootcamp.common.event.AsynchronousTrialEvent(
      wap.bootcamp.todolist.container.ProjectList.EventType.DELETE_PROJECT, trial, projectId));
};


/**
 * @param {wap.bootcamp.todolist.dto.Project} project
 * @return {wap.bootcamp.common.ui.ListItem} created list item
 */
wap.bootcamp.todolist.container.ProjectList.prototype.addProject = function(project) {
  return this.list_.addItem({
    caption: project.title,
    associatedData: project.id
  });
};


/**
 * @param {!Array.<wap.bootcamp.todolist.dto.Project>} projects
 * @return {Array.<wap.bootcamp.common.ui.ListItem>} created list items
 */
wap.bootcamp.todolist.container.ProjectList.prototype.addProjects = function(projects) {
  var items = goog.array.map(projects, function(project) {
    return {
      caption: project.title,
      associatedData: project.id
    };
  });
  return this.list_.addItems(items);
};


/**
 * @param {wap.bootcamp.common.ui.ListItem.<number>} listItem
 * @return {?number}
 */
wap.bootcamp.todolist.container.ProjectList.prototype.getProjectIdFrom = function(listItem) {
  return listItem.getAssociatedData() ? Number(listItem.getAssociatedData()) : null;
};

/**
 * @param {wap.bootcamp.common.event.AsynchronousTrialEvent.<string, *>} event
 * @private
 */
wap.bootcamp.todolist.container.ProjectList.prototype.validateProject_ = function(event) {
  var project = {
    title: String(event.target)
  };
  var trial = goog.Promise.withResolver();
  wap.bootcamp.common.logic.promise.redirect(trial.promise, event.trial);
  this.dispatchEvent(new wap.bootcamp.common.event.AsynchronousTrialEvent(
      wap.bootcamp.todolist.container.ProjectList.EventType.VALIDATE_PROJECT, trial, project));
  event.preventDefault();
};
