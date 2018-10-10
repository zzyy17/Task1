goog.provide('wap.bootcamp.common.ui.ListPlugin');

goog.require('goog.events.Event');


/**
 * @interface
 */
wap.bootcamp.common.ui.ListPlugin = function() {
};


/**
 * @return {Array.<string>}
 */
wap.bootcamp.common.ui.ListPlugin.prototype.getCssClasses;


/**
 * @param {Element} $listElement
 */
wap.bootcamp.common.ui.ListPlugin.prototype.canDecorateList;


/**
 * @param {wap.bootcamp.common.ui.List} list
 * @param {Object.<string, *>=} opt_params
 */
wap.bootcamp.common.ui.ListPlugin.prototype.decorateList;


/**
 * @param {wap.bootcamp.common.ui.List} list
 */
wap.bootcamp.common.ui.ListPlugin.prototype.disposeList;


/**
 * @param {wap.bootcamp.common.ui.List} list
 * @param {wap.bootcamp.common.ui.ListItem} item
 * @param {Object.<string, *>=} opt_params
 */
wap.bootcamp.common.ui.ListPlugin.prototype.createDomOfItem;


/**
 * @param {wap.bootcamp.common.ui.List} list
 * @param {wap.bootcamp.common.ui.ListItem} item
 * @param {Object.<string, *>=} opt_params
 */
wap.bootcamp.common.ui.ListPlugin.prototype.canDecorateItem;


/**
 * @param {wap.bootcamp.common.ui.List} list
 * @param {wap.bootcamp.common.ui.ListItem} item
 * @param {Object.<string, *>=} opt_params
 *
 * Note: when this method is called, a ListItem instance is already build
 * and the DOM element is set to item.getElement().
 */
wap.bootcamp.common.ui.ListPlugin.prototype.decorateItem;


/**
 * @param {wap.bootcamp.common.ui.List} list
 * @param {wap.bootcamp.common.ui.ListItem} item
 */
wap.bootcamp.common.ui.ListPlugin.prototype.disposeItem;


/**
 * @param {wap.bootcamp.common.ui.List} list list component which contains listItem
 * @param {wap.bootcamp.common.ui.ListItem} item event target list item
 * @param {goog.events.Event} event
 * @return {boolean} true iff a event is the target and successfully finished/cancelled. */
wap.bootcamp.common.ui.ListPlugin.prototype.handleClickEvent;
