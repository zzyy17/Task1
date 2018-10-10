goog.provide('wap.bootcamp.todolist.container.TaskList');

goog.require('goog.Promise');
goog.require('goog.dom');
goog.require('goog.dom.DomHelper');
goog.require('goog.dom.classlist');
goog.require('goog.events');
goog.require('goog.promise.Resolver');
goog.require('goog.ui.Component');
goog.require('goog.ui.Control');
goog.require('wap.bootcamp.common.event.AsynchronousTrialEvent');
goog.require('wap.bootcamp.common.logic.promise');
goog.require('wap.bootcamp.common.ui.CheckableListPlugin');
goog.require('wap.bootcamp.common.ui.List');
goog.require('wap.bootcamp.common.ui.ListItem');
goog.require('wap.bootcamp.common.ui.ListPlugin');
goog.require('wap.bootcamp.todolist.dto.Project');
goog.require('wap.bootcamp.todolist.dto.Task');
goog.require('wap.bootcamp.todolist.ui.Foldable');
goog.require('wap.bootcamp.todolist.ui.Registrar');


/**
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.ui.Component}
 */
wap.bootcamp.todolist.container.TaskList = function(opt_domHelper) {
  goog.base(this, opt_domHelper);

  /**
   * @type {?wap.bootcamp.todolist.dto.Project}
   * @private
   */
  this.project_ = null;

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
   * Divert {@link goog.ui.Control} as a label UI component.
   * @type {goog.ui.Control}
   * @private
   */
  this.projectLabel_;

  /**
   * @type {boolean}
   * @private
   */
  this.enabled_ = false;

  this.buildComponents_();
};
goog.inherits(wap.bootcamp.todolist.container.TaskList, goog.ui.Component);

/** @type {string} */
wap.bootcamp.todolist.container.TaskList.CSS_CLASS = goog.getCssName('task-list');


/** @enum {string} */
wap.bootcamp.todolist.container.TaskList.CSS_CLASSES = {
  PROJECT_NAME: goog.getCssName('project-name'),
  DISABLED: goog.getCssName('disabled')
};


/** @enum {string} */
wap.bootcamp.todolist.container.TaskList.EventType = {
  CREATE_TASK: goog.events.getUniqueId('create-task'),
  UPDATE_TASK: goog.events.getUniqueId('update-task'),
  VALIDATE_TASK: goog.events.getUniqueId('validate-project')
};


/** @private */
wap.bootcamp.todolist.container.TaskList.prototype.buildComponents_ = function() {
  this.list_ = new wap.bootcamp.common.ui.List([
    wap.bootcamp.common.ui.CheckableListPlugin.getInstance()
  ]);
  this.addChild(this.list_);

  this.foldable_ = new wap.bootcamp.todolist.ui.Foldable();
  this.addChild(this.foldable_);

  this.registrar_ = new wap.bootcamp.todolist.ui.Registrar();
  this.addChild(this.registrar_);

  this.projectLabel_ = new goog.ui.Control();
  this.addChild(this.projectLabel_);
};


/** @private */
wap.bootcamp.todolist.container.TaskList.prototype.discardComponents_ = function() {
  this.removeChildren();
  this.list_ = null;
  this.foldable_ = null;
  this.registrar_ = null;
  this.projectLabel_ = null;
};


/** @override */
wap.bootcamp.todolist.container.TaskList.prototype.canDecorate = function($element) {
  var $list = this.findListElement_($element);
  var $foldable = this.findFoldableElement_($element);
  var $registrar = this.findRegistrarElement_($element);
  var $projectLabel = this.findProjectLabelElement_($element);
  return (
      goog.base(this, 'canDecorate', $element) &&
      Boolean($list) &&
      this.list_.canDecorate($list) &&
      Boolean($foldable) &&
      this.foldable_.canDecorate($foldable) &&
      Boolean($registrar) &&
      this.registrar_.canDecorate($registrar) &&
      Boolean($projectLabel) &&
      this.projectLabel_.canDecorate($projectLabel)
  );
};


/**
 * @param {Element} $element
 * @return {Element}
 * @private
 */
wap.bootcamp.todolist.container.TaskList.prototype.findListElement_ = function($element) {
  return this.getDomHelper().getElementByClass(wap.bootcamp.common.ui.List.CSS_CLASS, $element);
};


/**
 * @param {Element} $element
 * @return {Element}
 * @private
 */
wap.bootcamp.todolist.container.TaskList.prototype.findFoldableElement_ = function($element) {
  return this.getDomHelper().getElementByClass(wap.bootcamp.todolist.ui.Foldable.CSS_CLASS, $element);
};


/**
 * @param {Element} $element
 * @return {Element}
 * @private
 */
wap.bootcamp.todolist.container.TaskList.prototype.findRegistrarElement_ = function($element) {
  return this.getDomHelper().getElementByClass(wap.bootcamp.todolist.ui.Registrar.CSS_CLASS, $element);
};


/**
 * @param {Element} $element
 * @return {Element}
 * @private
 */
wap.bootcamp.todolist.container.TaskList.prototype.findProjectLabelElement_ = function($element) {
  return this.getDomHelper().getElementByClass(
      wap.bootcamp.todolist.container.TaskList.CSS_CLASSES.PROJECT_NAME, $element);
};


/** @override */
wap.bootcamp.todolist.container.TaskList.prototype.decorateInternal = function($element) {
  goog.base(this, 'decorateInternal', $element);

  this.list_.decorate(this.findListElement_($element));
  this.foldable_.decorate(this.findFoldableElement_($element));
  this.registrar_.decorate(this.findRegistrarElement_($element));
  (/** @type {goog.ui.Component} */ (this.projectLabel_)).decorate(this.findProjectLabelElement_($element));

  this.enabled_ = !goog.dom.classlist.contains(
      $element, wap.bootcamp.todolist.container.TaskList.CSS_CLASSES.DISABLED);
};


/** @override */
wap.bootcamp.todolist.container.TaskList.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  this.discardComponents_();
  this.project_ = null;
  this.enabled_ = false;
};


/** @override */
wap.bootcamp.todolist.container.TaskList.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.getHandler().listen(
      this.registrar_,
      wap.bootcamp.todolist.ui.Registrar.EventType.ADD,
      this.tryAddTask_
  );
  this.getHandler().listen(
      this.list_,
      wap.bootcamp.common.ui.CheckableListPlugin.EventType.ITEM_CHECKED,
      this.tryToggleTask_
  );
  this.getHandler().listen(
      this.registrar_,
      wap.bootcamp.todolist.ui.Registrar.EventType.VALIDATE,
      this.validateTask_
  );
};


/**
 * @param {wap.bootcamp.todolist.ui.Registrar.AddEvent} event
 * @private
 */
wap.bootcamp.todolist.container.TaskList.prototype.tryAddTask_ = function(event) {
  var trialTask = {
    projectId: this.project_.id,
    title: event.text,
    done: false
  };
  /** @type {goog.promise.Resolver.<wap.bootcamp.todolist.dto.Task>} */
  var trial = goog.Promise.withResolver();
  trial.promise
      .then(function(savedTask) {
        this.list_.addItem({
          caption: savedTask.title,
          associatedData: savedTask.id
        });
      }.bind(this))
      .thenCatch(function(error) {
        alert(error);
      });

  this.dispatchEvent(new wap.bootcamp.common.event.AsynchronousTrialEvent(
      wap.bootcamp.todolist.container.TaskList.EventType.CREATE_TASK, trial, trialTask));
};


/**
 * @param {wap.bootcamp.common.ui.CheckableListPlugin.ItemCheckEvent} event
 * @private
 */
wap.bootcamp.todolist.container.TaskList.prototype.tryToggleTask_ = function(event) {
  var listItem = /** @type {wap.bootcamp.common.ui.ListItem} */(event.target);
  if (this.list_.isChecked(listItem) && !confirm('Are you sure to make a task \'' +
      listItem.getCaption() + '\' undone?')) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  /** @type {goog.promise.Resolver.<wap.bootcamp.todolist.dto.Task>} */
  var trial = goog.Promise.withResolver();
  trial.promise
      .thenCatch(function(error) {
        alert(error);
        this.list_.toggleChecked(listItem);
      }.bind(this));

  var task = {
    id: listItem.getAssociatedData(),
    projectId: this.project_.id,
    title: listItem.getCaption(),
    done: !this.list_.isChecked(listItem) // isChecked is not toggled yet.
  };
  this.dispatchEvent(new wap.bootcamp.common.event.AsynchronousTrialEvent(
      wap.bootcamp.todolist.container.TaskList.EventType.UPDATE_TASK, trial, task));
};


/**
 * @param {wap.bootcamp.todolist.dto.Task} task
 * @return {wap.bootcamp.common.ui.ListItem} created listItems
 */
wap.bootcamp.todolist.container.TaskList.prototype.addTask = function(task) {
  return this.list_.addItem({
    caption: task.title,
    associatedData: task.id,
    checked: task.done
  });
};


/**
 * @param {!Array.<wap.bootcamp.todolist.dto.Task>} tasks
 * @return {Array.<wap.bootcamp.common.ui.ListItem>} created listItems
 */
wap.bootcamp.todolist.container.TaskList.prototype.addTasks = function(tasks) {
  var items = goog.array.map(tasks, function(task) {
    return {
      caption: task.title,
      associatedData: task.id,
      checked: task.done
    };
  });
  return this.list_.addItems(items);
};


/**
 * @param {?wap.bootcamp.todolist.dto.Project} project
 */
wap.bootcamp.todolist.container.TaskList.prototype.setProject = function(project) {
  this.project_ = project;
  this.projectLabel_.setCaption(project ? project.title : '');
  this.list_.removeAll();
  this.setEnabled(Boolean(project));
};


/**
 * @return {?wap.bootcamp.todolist.dto.Project}
 */
wap.bootcamp.todolist.container.TaskList.prototype.getProject = function() {
  return this.project_;
};


/**
 * @param {wap.bootcamp.common.ui.ListItem.<number>} listItem
 * @return {?number}
 */
wap.bootcamp.todolist.container.TaskList.prototype.getTaskIdFrom = function(listItem) {
  return listItem.getAssociatedData() ? Number(listItem.getAssociatedData()) : null;
};


/**
 * @return {boolean}
 */
wap.bootcamp.todolist.container.TaskList.prototype.isEnabled = function() {
  return this.enabled_;
};


/**
 * @param {boolean} enabled
 */
wap.bootcamp.todolist.container.TaskList.prototype.setEnabled = function(enabled) {
  this.enabled_ = enabled;
  this.list_.setEnabled(enabled);
  this.registrar_.setEnabled(enabled);
  goog.dom.classlist.enable(this.getElement(),
      wap.bootcamp.todolist.container.TaskList.CSS_CLASSES.DISABLED, !enabled);
};

/**
 * @param {wap.bootcamp.common.event.AsynchronousTrialEvent.<string, *>} event
 * @private
 */
wap.bootcamp.todolist.container.TaskList.prototype.validateTask_ = function(event) {
  var task = {
    projectId: this.project_.id,
    title: (event.target),
    done: false
  };
  var trial = goog.Promise.withResolver();
  wap.bootcamp.common.logic.promise.redirect(trial.promise, event.trial);
  this.dispatchEvent(new wap.bootcamp.common.event.AsynchronousTrialEvent(
    wap.bootcamp.todolist.container.TaskList.EventType.VALIDATE_TASK, trial, task));
  event.preventDefault();
};
