goog.provide('wap.bootcamp.common.ui.DeletableListPlugin');

goog.require('goog.dom');
goog.require('goog.events.Event');
goog.require('goog.functions');
goog.require('wap.bootcamp.common.ui.ListPlugin');


/**
 * @constructor
 * @implements {wap.bootcamp.common.ui.ListPlugin}
 */
wap.bootcamp.common.ui.DeletableListPlugin = function() {
};
goog.addSingletonGetter(wap.bootcamp.common.ui.DeletableListPlugin);


/** @type {string} */
wap.bootcamp.common.ui.DeletableListPlugin.CSS_CLASS = goog.getCssName('deletable-list');


/** @enum {string} */
wap.bootcamp.common.ui.DeletableListPlugin.CSS_CLASSES = {
  ITEM: goog.getCssName('deletable-list-item'),
  DELETE_BUTTON: goog.getCssName('deletable-list-delete-button')
};


/** @override */
wap.bootcamp.common.ui.DeletableListPlugin.prototype.getCssClasses =
  goog.functions.constant(
    [wap.bootcamp.common.ui.DeletableListPlugin.CSS_CLASS]
  );


/** @override */
wap.bootcamp.common.ui.DeletableListPlugin.prototype.canDecorateList =
  goog.functions.constant(true);


/** @override */
wap.bootcamp.common.ui.DeletableListPlugin.prototype.decorateList = function(list, opt_params) {
};


/** @override */
wap.bootcamp.common.ui.DeletableListPlugin.prototype.disposeList = function(list) {
};


/** @override */
wap.bootcamp.common.ui.DeletableListPlugin.prototype.createDomOfItem = function(list, item, opt_params) {
  var $deleteButton = goog.dom.createDom(
    goog.dom.TagName.INPUT,
    {
      'type': 'button',
      'class': wap.bootcamp.common.ui.DeletableListPlugin.CSS_CLASSES.DELETE_BUTTON,
      'value': '×'
    });
  item.getElement().appendChild($deleteButton);
};


/** @override */
wap.bootcamp.common.ui.DeletableListPlugin.prototype.canDecorateItem = function(list, item, opt_params) {
  return Boolean(this.selectDeleteButtonElement_(item.getElement()));
};


/**
 * @param {Element} $listElement
 * @return {?Element}
 * @private
 */
wap.bootcamp.common.ui.DeletableListPlugin.prototype.selectDeleteButtonElement_ =
  function($listElement) {
    return goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.INPUT,
      wap.bootcamp.common.ui.DeletableListPlugin.CSS_CLASSES.DELETE_BUTTON,
      $listElement
    )[0] || null;
  };


/** @override */
wap.bootcamp.common.ui.DeletableListPlugin.prototype.decorateItem = function(list, item, opt_params) {
  /** @type {Element} */
  item.$deleteButton_ = this.selectDeleteButtonElement_(item.getElement());
};


/** @override */
wap.bootcamp.common.ui.DeletableListPlugin.prototype.disposeItem = function(list, item) {
  if (item.$deleteButton_) {
    item.$deleteButton_ = null;
  }
};


/** @override */
wap.bootcamp.common.ui.DeletableListPlugin.prototype.handleClickEvent = function(list, item, event) {
  if (!item.$deleteButton_ || item.$deleteButton_ !== event.target) {
    return false;
  }
  var deleteEvent = new wap.bootcamp.common.ui.DeletableListPlugin.ItemDeleteEvent(item);
  if (list.dispatchEvent(deleteEvent)) {
    list.removeItem(item);
  }
  return true;
};


/**
 * @enum {string}
 */
wap.bootcamp.common.ui.DeletableListPlugin.EventType = {
  ITEM_DELETE: goog.events.getUniqueId('item-delete')
};


/**
 * @param {wap.bootcamp.common.ui.ListItem} listItem
 * @constructor
 * @extends {goog.events.Event}
 */
wap.bootcamp.common.ui.DeletableListPlugin.ItemDeleteEvent = function(listItem) {
  goog.base(this, wap.bootcamp.common.ui.DeletableListPlugin.EventType.ITEM_DELETE, listItem);
};
goog.inherits(wap.bootcamp.common.ui.DeletableListPlugin.ItemDeleteEvent, goog.events.Event);
