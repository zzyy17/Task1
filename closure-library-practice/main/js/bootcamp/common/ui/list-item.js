goog.provide('wap.bootcamp.common.ui.ListItem');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.ui.Component');


/**
 * @param {{caption: (string|undefined), associatedData: (ASSOC_TYPE|undefined)}=} opt_params
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper
 * @constructor
 * @extends {goog.ui.Component}
 * @template ASSOC_TYPE
 */
wap.bootcamp.common.ui.ListItem = function(opt_params, opt_domHelper) {
  goog.base(this, opt_domHelper);

  /**
   * @type {string}
   * @private
   */
  this.caption_ = opt_params ? (opt_params.caption || '') : '';

  /**
   * @type {ASSOC_TYPE}
   * @private
   */
  this.associatedData_ = opt_params ? (opt_params.associatedData || null) : null;

  /**
   * @type {Element}
   * @private
   */
  this.$caption_ = null;
};
goog.inherits(wap.bootcamp.common.ui.ListItem, goog.ui.Component);


/**
 * @type {string}
 */
wap.bootcamp.common.ui.ListItem.CSS_CLASS = goog.getCssName('list-item');


/**
 * @type {Object.<string, string>}
 */
wap.bootcamp.common.ui.ListItem.CSS_CLASSES = {
  CAPTION: goog.getCssName('list-item-caption')
};


/** @override */
wap.bootcamp.common.ui.ListItem.prototype.createDom = function() {
  // no need to call base method.
  var $element = this.getDomHelper().createDom(
    goog.dom.TagName.LI,
    {'class': wap.bootcamp.common.ui.ListItem.CSS_CLASS},
    this.getDomHelper().createDom(
      goog.dom.TagName.SPAN,
      {'class': wap.bootcamp.common.ui.ListItem.CSS_CLASSES.CAPTION},
      this.caption_
    ));
  this.setElementInternal($element);
};


/** @override */
wap.bootcamp.common.ui.ListItem.prototype.canDecorate = function($element) {
  return (
    goog.base(this, 'canDecorate', $element) &&
    $element.tagName === goog.dom.TagName.LI &&
    Boolean(this.getDomHelper().getElementByClass(
      wap.bootcamp.common.ui.ListItem.CSS_CLASSES.CAPTION, $element))
  );
};


/** @override */
wap.bootcamp.common.ui.ListItem.prototype.decorateInternal = function($element) {
  goog.base(this, 'decorateInternal', $element);
  if (!$element.id) {
    $element.id = wap.bootcamp.common.ui.ListItem.CSS_CLASS + this.getId();
  }

  this.$caption_ = this.getDomHelper().getElementByClass(
    wap.bootcamp.common.ui.ListItem.CSS_CLASSES.CAPTION, $element);
  this.caption_ = this.getDomHelper().getTextContent(this.$caption_);
};


/** @override */
wap.bootcamp.common.ui.ListItem.prototype.disposeInternal = function() {
  this.$caption_ = null;
  this.caption_ = '';
  this.associatedData = null;
  goog.base(this, 'disposeInternal');
};


/**
 * @return {string}
 */
wap.bootcamp.common.ui.ListItem.prototype.getCaption = function() {
  return this.caption_;
};


/**
 * @param {string} caption
 */
wap.bootcamp.common.ui.ListItem.prototype.setCaption = function(caption) {
  this.caption_ = caption;
  this.getDomHelper().setTextContent(this.$caption_, caption);
};


/**
 * @return {Element}
 * @protected
 */
wap.bootcamp.common.ui.ListItem.prototype.getCaptionElement = function() {
  return this.$caption_;
};


/**
 * @return {ASSOC_TYPE}
 */
wap.bootcamp.common.ui.ListItem.prototype.getAssociatedData = function() {
  return this.associatedData_;
};


/**
 * @param {ASSOC_TYPE} data
 */
wap.bootcamp.common.ui.ListItem.prototype.setAssociatedData = function(data) {
  this.associatedData_ = data;
};


/**
 * @enum {string}
 */
wap.bootcamp.common.ui.ListItem.EventType = {
  ITEM_CLICK: goog.events.getUniqueId('item-click')
};


/**
 * @param {wap.bootcamp.common.ui.ListItem} listItem
 * @constructor
 * @extends {goog.events.Event}
 */
wap.bootcamp.common.ui.ListItem.ItemClickEvent = function(listItem) {
  goog.base(this, wap.bootcamp.common.ui.ListItem.EventType.ITEM_CLICK, listItem);
};
goog.inherits(wap.bootcamp.common.ui.ListItem.ItemClickEvent, goog.events.Event);
