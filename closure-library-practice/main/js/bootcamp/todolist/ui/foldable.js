goog.provide('wap.bootcamp.todolist.ui.Foldable');

goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.events.EventType');
goog.require('goog.ui.Component');


/**
 * Foldable UI Component
 *
 * Note: This component is for UI component development. Generally use goog.ui.Zippy instead.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper
 * @constructor
 * @extends {goog.ui.Component}
 */
wap.bootcamp.todolist.ui.Foldable = function(opt_domHelper) {
  goog.base(this, opt_domHelper);

  /**
   * @type {?boolean}
   * @private
   */
  this.expanded_ = null;
};
goog.inherits(wap.bootcamp.todolist.ui.Foldable, goog.ui.Component);


/**
 * @type {string}
 */
wap.bootcamp.todolist.ui.Foldable.CSS_CLASS = goog.getCssName('foldable');


/**
 * @enum {string}
 */
wap.bootcamp.todolist.ui.Foldable.CSS_CLASSES = {
  HEADER: goog.getCssName('foldable-header'),
  CONTENT: goog.getCssName('foldable-content'),
  EXPANDED: goog.getCssName('foldable-expanded'),
  CONTRACTED: goog.getCssName('foldable-contracted')
};


/** @override */
wap.bootcamp.todolist.ui.Foldable.prototype.canDecorate = function($element) {
  return (
    goog.base(this, 'canDecorate', $element) &&
    goog.dom.classlist.contains($element, wap.bootcamp.todolist.ui.Foldable.CSS_CLASS) &&
    Boolean(this.findHeaderElement_($element))
  );
};


/** @override */
wap.bootcamp.todolist.ui.Foldable.prototype.decorateInternal = function($element) {
  goog.base(this, 'decorateInternal', $element);
  this.expanded_ = goog.dom.classlist.contains(
    this.getElement(), wap.bootcamp.todolist.ui.Foldable.CSS_CLASSES.EXPANDED);
};


/** @override */
wap.bootcamp.todolist.ui.Foldable.prototype.disposeInternal = function() {
  this.$text_ = null;
  goog.base(this, 'disposeInternal');
};


/** @override */
wap.bootcamp.todolist.ui.Foldable.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.getHandler().listen(
    this.findHeaderElement_(this.getElement()),
    goog.events.EventType.CLICK,
    this.toggleExpanded
  );
};


/**
 * @return {boolean}
 */
wap.bootcamp.todolist.ui.Foldable.prototype.isExpanded = function() {
  return Boolean(this.expanded_);
};


/**
 * @param {boolean} expanded
 */
wap.bootcamp.todolist.ui.Foldable.prototype.setExpanded = function(expanded) {
  this.expanded_ = expanded;
  if (expanded) {
    goog.dom.classlist.swap(this.getElement(),
        wap.bootcamp.todolist.ui.Foldable.CSS_CLASSES.CONTRACTED,
        wap.bootcamp.todolist.ui.Foldable.CSS_CLASSES.EXPANDED);
  } else {
    goog.dom.classlist.swap(this.getElement(),
        wap.bootcamp.todolist.ui.Foldable.CSS_CLASSES.EXPANDED,
        wap.bootcamp.todolist.ui.Foldable.CSS_CLASSES.CONTRACTED);
  }
};


/**
 *
 */
wap.bootcamp.todolist.ui.Foldable.prototype.toggleExpanded = function() {
  this.setExpanded(!this.isExpanded());
};


/**
 * @param {Element} $element
 * @private
 * @return {Element}
 */
wap.bootcamp.todolist.ui.Foldable.prototype.findHeaderElement_ = function($element) {
  return this.getDomHelper().getElementByClass(
      wap.bootcamp.todolist.ui.Foldable.CSS_CLASSES.HEADER, $element);
};
