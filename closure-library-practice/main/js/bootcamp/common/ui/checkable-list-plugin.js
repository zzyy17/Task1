goog.provide('wap.bootcamp.common.ui.CheckableListPlugin');

goog.require('goog.dom');
goog.require('goog.events.Event');
goog.require('goog.functions');
goog.require('wap.bootcamp.common.ui.List');
goog.require('wap.bootcamp.common.ui.ListItem');
goog.require('wap.bootcamp.common.ui.ListPlugin');


/**
 * @constructor
 * @implements {wap.bootcamp.common.ui.ListPlugin}
 */
wap.bootcamp.common.ui.CheckableListPlugin = function() {
};
goog.addSingletonGetter(wap.bootcamp.common.ui.CheckableListPlugin);


/** @type {string} */
wap.bootcamp.common.ui.CheckableListPlugin.CSS_CLASS = goog.getCssName('checkable-list');


/** @enum {string} */
wap.bootcamp.common.ui.CheckableListPlugin.CSS_CLASSES = {
  ITEM: goog.getCssName('checkable-list-item'),
  ITEM_CHECKED: goog.getCssName('checkable-list-item-checked'),
  CHECKBOX: goog.getCssName('checkable-list-checkbox')
};


/** @override */
wap.bootcamp.common.ui.CheckableListPlugin.prototype.getCssClasses =
  goog.functions.constant(
    [wap.bootcamp.common.ui.CheckableListPlugin.CSS_CLASS]
  );


/** @override */
wap.bootcamp.common.ui.CheckableListPlugin.prototype.canDecorateList =
  goog.functions.constant(true);


/** @override */
wap.bootcamp.common.ui.CheckableListPlugin.prototype.decorateList = function(list, opt_params) {
  // If memory usage is to be considered,
  // just make all methods independent as constants of the plugin.

  /**
   * @param {wap.bootcamp.common.ui.ListItem} item
   * @return {boolean}
   */
  list.isItemCheckable = function(item) {
    return Boolean(item.$checkbox_);
  };


  /**
   * @param {wap.bootcamp.common.ui.ListItem} item
   * @return {boolean}
   */
  list.isChecked = function(item) {
    if (!item.$checkbox_) {
      throw Error('List item is not checkable', item);
    }
    return item.checked_;
  };

  /**
   * @param {wap.bootcamp.common.ui.ListItem} item
   * @param {boolean} checked
   * @return {boolean}
   * @this {wap.bootcamp.common.ui.List}
   */
  list.trySetChecked = function(item, checked) {
    if (!item.$checkbox_) {
      throw Error('List item is not checkable', item);
    }
    if (this.isChecked(item) === checked) {
      return checked;
    }
    var checkEvent = new wap.bootcamp.common.ui.CheckableListPlugin.ItemCheckEvent(item);
    if (item.dispatchEvent(checkEvent)) {
      item.$checkbox_.checked = checked;
      item.checked_ = checked;
      goog.dom.classlist.enable(
        item.getElement(),
        wap.bootcamp.common.ui.CheckableListPlugin.CSS_CLASSES.ITEM_CHECKED,
        checked
      );
      return checked;
    } else {
      item.$checkbox_.checked = !checked;
      return !checked;
    }
  };


  /**
   * @param {wap.bootcamp.common.ui.ListItem} item
   * @return {boolean}
   * @this {wap.bootcamp.common.ui.List}
   */
  list.tryToggleChecked = function(item) {
    return this.trySetChecked(item, !this.isChecked(item));
  };


  /**
   * @param {wap.bootcamp.common.ui.ListItem} item
   * @param {boolean} checked
   * @return {boolean}
   * @this {wap.bootcamp.common.ui.List}
   */
  list.setChecked = function(item, checked) {
    if (!item.$checkbox_) {
      throw Error('List item is not checkable', item);
    }
    if (this.isChecked(item) === checked) {
      return checked;
    }

    item.$checkbox_.checked = checked;
    item.checked_ = checked;
    goog.dom.classlist.enable(
      item.getElement(),
      wap.bootcamp.common.ui.CheckableListPlugin.CSS_CLASSES.ITEM_CHECKED,
      checked
    );
    return checked;
  };


  /**
   * @param {wap.bootcamp.common.ui.ListItem} item
   * @return {boolean}
   * @this {wap.bootcamp.common.ui.List}
   */
  list.toggleChecked = function(item) {
    return this.setChecked(item, !this.isChecked(item));
  };
};


/** @override */
wap.bootcamp.common.ui.CheckableListPlugin.prototype.disposeList = function(list) {
  delete list.isItemCheckable;
  delete list.isChecked;
  delete list.setChecked;
  delete list.toggleChecked;
};


/** @override */
wap.bootcamp.common.ui.CheckableListPlugin.prototype.createDomOfItem = function(list, item, opt_params) {
  var $checkbox = goog.dom.createDom(
    goog.dom.TagName.INPUT,
    {
      'type': 'checkbox',
      'class': wap.bootcamp.common.ui.CheckableListPlugin.CSS_CLASSES.CHECKBOX
    });
  if (opt_params.checked) {
    $checkbox.checked = true;
    goog.dom.classlist.add(item.getElement(), wap.bootcamp.common.ui.CheckableListPlugin.CSS_CLASSES.ITEM_CHECKED);
  }
  item.getElement().insertBefore($checkbox, item.getElement().firstChild);
};


/** @override */
wap.bootcamp.common.ui.CheckableListPlugin.prototype.canDecorateItem = function(list, item, opt_params) {
  var $checkbox = this.selectCheckboxElement_(item.getElement());
  return Boolean($checkbox) &&
    (goog.dom.classlist.contains($checkbox, wap.bootcamp.common.ui.CheckableListPlugin.CSS_CLASSES.ITEM_CHECKED) ===
      $checkbox.checked);
};


/**
 * @param {Element} $listElement
 * @return {?Element}
 * @private
 */
wap.bootcamp.common.ui.CheckableListPlugin.prototype.selectCheckboxElement_ =
  function($listElement) {
    return goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.INPUT,
      wap.bootcamp.common.ui.CheckableListPlugin.CSS_CLASSES.CHECKBOX,
      $listElement
    )[0] || null;
  };


/** @override */
wap.bootcamp.common.ui.CheckableListPlugin.prototype.decorateItem = function(list, item, opt_params) {
  /** @type {Element} */
  item.$checkbox_ = this.selectCheckboxElement_(item.getElement());
  /** @type {boolean} */
  item.checked_ = item.$checkbox_.checked;
};


/** @override */
wap.bootcamp.common.ui.CheckableListPlugin.prototype.disposeItem = function(list, item) {
  if (item.$checkbox_) {
    delete item.$checkbox_;
  }
};


/** @override */
wap.bootcamp.common.ui.CheckableListPlugin.prototype.handleClickEvent = function(list, item, event) {
  if (!item.$checkbox_ || item.$checkbox_ !== event.target) {
    return false;
  }
  var checkEvent = new wap.bootcamp.common.ui.CheckableListPlugin.ItemCheckEvent(item);
  if (list.dispatchEvent(checkEvent)) {
    list.toggleChecked(item);
  } else {
    event.preventDefault();
  }
  return true;
};


/**
 * @enum {string}
 */
wap.bootcamp.common.ui.CheckableListPlugin.EventType = {
  ITEM_CHECKED: goog.events.getUniqueId('list-item-checked')
};


/**
 * @param {wap.bootcamp.common.ui.ListItem} listItem
 * @constructor
 * @extends {goog.events.Event}
 */
wap.bootcamp.common.ui.CheckableListPlugin.ItemCheckEvent = function(listItem) {
  goog.base(this, wap.bootcamp.common.ui.CheckableListPlugin.EventType.ITEM_CHECKED, listItem);
};
goog.inherits(wap.bootcamp.common.ui.CheckableListPlugin.ItemCheckEvent, goog.events.Event);
