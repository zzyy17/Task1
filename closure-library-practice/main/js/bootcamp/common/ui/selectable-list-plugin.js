goog.provide('wap.bootcamp.common.ui.SelectableListPlugin');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.events.Event');
goog.require('goog.functions');
goog.require('wap.bootcamp.common.ui.List');
goog.require('wap.bootcamp.common.ui.ListItem');
goog.require('wap.bootcamp.common.ui.ListPlugin');


/**
 * @constructor
 * @implements {wap.bootcamp.common.ui.ListPlugin}
 */
wap.bootcamp.common.ui.SelectableListPlugin = function() {
};
goog.addSingletonGetter(wap.bootcamp.common.ui.SelectableListPlugin);


/** @type {string} */
wap.bootcamp.common.ui.SelectableListPlugin.CSS_CLASS = goog.getCssName('selectable-list');


/** @enum {string} */
wap.bootcamp.common.ui.SelectableListPlugin.CSS_CLASSES = {
  ITEM: goog.getCssName('selectable-list-item'),
  ITEM_SELECTED: goog.getCssName('selectable-list-item-selected')
};


/** @override */
wap.bootcamp.common.ui.SelectableListPlugin.prototype.getCssClasses =
  goog.functions.constant(
    [wap.bootcamp.common.ui.SelectableListPlugin.CSS_CLASS]
  );


/** @override */
wap.bootcamp.common.ui.SelectableListPlugin.prototype.canDecorateList =
  goog.functions.constant(true);


/** @override */
wap.bootcamp.common.ui.SelectableListPlugin.prototype.decorateList = function(list, opt_params) {
  // If memory usage is to be considered,
  // just make all methods independent as constants of the plugin.

  /** @type {Array.<wap.bootcamp.common.ui.ListItem>} */
  list.selected_ = [];

  /** @type {boolean} */
  list.allowMultipleSelect_ = opt_params ? Boolean(opt_params.allowMultipleSelect_) : false;

  /** @type {boolean} */
  list.allowClearSelect_ = opt_params ? Boolean(opt_params.allowClearSelect_) : false;


  /**
   * @param {wap.bootcamp.common.ui.ListItem} item
   * @return {boolean}
   * @this {wap.bootcamp.common.ui.List}
   */
  list.isSelected = function(item) {
    return goog.array.contains(this.selected_, item);
  };


  /**
   * @return {wap.bootcamp.common.ui.ListItem}
   * @this {wap.bootcamp.common.ui.List}
   */
  list.getSelected = function() {
    return this.selected_[0] || null;
  };


  /**
   * @return {Array.<wap.bootcamp.common.ui.ListItem>}
   * @this {wap.bootcamp.common.ui.List}
   */
  list.getSelectedAll = function() {
    return goog.array.clone(this.selected_);
  };


  /**
   * @param {wap.bootcamp.common.ui.ListItem} item
   * @param {boolean} selected
   * @return {boolean}
   * @this {wap.bootcamp.common.ui.List}
   */
  list.setSelected = function(item, selected) {
    if (!selected && this.selected_.length === 1 && this.selected_[0] === item) {
      return true;
    }
    return this.setSelected_(item, selected);
  };


  /**
   * @param {wap.bootcamp.common.ui.ListItem} item
   * @param {boolean} selected
   * @return {boolean}
   * @this {wap.bootcamp.common.ui.List}
   */
  list.setSelectedWithEvent = function(item, selected) {
    if (!selected && this.selected_.length === 1 && this.selected_[0] === item) {
      return true;
    }
    var selectEvent = new wap.bootcamp.common.ui.SelectableListPlugin.ItemSelectEvent(item);
    if (list.dispatchEvent(selectEvent)) {
      return list.setSelected_(item, true);
    } else {
      return false;
    }
  };


  /**
   * @param {wap.bootcamp.common.ui.ListItem} item
   * @param {boolean} selected
   * @return {boolean}
   * @this {wap.bootcamp.common.ui.List}
   * @private
   */
  list.setSelected_ = function(item, selected) {
    if (!this.allowMultipleSelect_) {
      this.selected_.forEach(function(selectedItem) {
        goog.dom.classlist.remove(selectedItem.getElement(),
          wap.bootcamp.common.ui.SelectableListPlugin.CSS_CLASSES.ITEM_SELECTED);
      }.bind(this));
      this.selected_ = [];
    }
    goog.dom.classlist.enable(item.getElement(),
      wap.bootcamp.common.ui.SelectableListPlugin.CSS_CLASSES.ITEM_SELECTED, selected);
    if (selected) {
      this.selected_.push(item);
    } else {
      goog.array.remove(this.selected_, item);
    }
    return selected;
  };


  /**
   * @param {wap.bootcamp.common.ui.ListItem} item
   * @return {boolean}
   * @this {wap.bootcamp.common.ui.List}
   */
  list.toggleSelected = function(item) {
    return this.setSelected(item, !this.isSelected(item));
  };
};


/** @override */
wap.bootcamp.common.ui.SelectableListPlugin.prototype.disposeList = function(list) {
  delete list.selected_;
  delete list.allowMultipleSelect_;
  delete list.allowClearSelect_;
  delete list.isSelected;
  delete list.getSelected;
  delete list.getSelectedAll;
  delete list.setSelected;
  delete list.setSelectedWithEvent;
  delete list.setSelected_;
  delete list.toggleSelected;
};


/** @override */
wap.bootcamp.common.ui.SelectableListPlugin.prototype.createDomOfItem = function(list, item, opt_params) {
};


/** @override */
wap.bootcamp.common.ui.SelectableListPlugin.prototype.canDecorateItem = goog.functions.constant(true);


/** @override */
wap.bootcamp.common.ui.SelectableListPlugin.prototype.decorateItem = function(list, item, opt_params) {
  var isSelectedClassSet = goog.dom.classlist.contains(item.getElement(),
    wap.bootcamp.common.ui.SelectableListPlugin.CSS_CLASSES.ITEM_SELECTED);
  var shouldBeNewlyItemSelected = !list.allowClearSelect_ &&
    list.getChildCount() > 0 && this.hasListNoSelectedItem_(list);
  if (isSelectedClassSet || shouldBeNewlyItemSelected) {
    list.setSelectedWithEvent(item, true);
  }
};


/**
 * @param {wap.bootcamp.common.ui.List} list
 * @return {boolean}
 * @private
 */
wap.bootcamp.common.ui.SelectableListPlugin.prototype.hasListNoSelectedItem_ = function(list) {
  var result = true;
  list.forEachChild(function(listItem) {
    if (list.isSelected(listItem)) {
      result = false;
    }
  });
  return result;
};


/** @override */
wap.bootcamp.common.ui.SelectableListPlugin.prototype.disposeItem = function(list, item) {
  if (!list.isSelected(item)) {
    return;
  }
  list.setSelected_(item, false);
  if (list.allowClearSelect_) {
    return;
  }
  for (var i = 0, length = list.getChildCount(); i < length; i++) {
    var newlySelectedCandidate = /** @type {wap.bootcamp.common.ui.ListItem} */(list.getChildAt(i));
    if (newlySelectedCandidate === item) {
      continue;
    }
    var selectEvent = new wap.bootcamp.common.ui.SelectableListPlugin.ItemSelectEvent(newlySelectedCandidate);
    if (list.dispatchEvent(selectEvent)) {
      list.setSelected_(newlySelectedCandidate, true);
    }
    return;
  }
  var willBeEmpty = (list.getChildCount() === 1); // the last item is not removed yet.
  if (willBeEmpty) {
    var noneSelectEvent = new wap.bootcamp.common.ui.SelectableListPlugin.ItemSelectEvent(null);
    list.dispatchEvent(noneSelectEvent);
  }
};


/** @override */
wap.bootcamp.common.ui.SelectableListPlugin.prototype.handleClickEvent = function(list, item, event) {
  if (list.isSelected(item)) {
    return false;
  }
  var selectEvent = new wap.bootcamp.common.ui.SelectableListPlugin.ItemSelectEvent(item);
  if (list.dispatchEvent(selectEvent)) {
    list.toggleSelected(item);
  }
  return true;
};


/**
 * @enum {string}
 */
wap.bootcamp.common.ui.SelectableListPlugin.EventType = {
  ITEM_SELECT: goog.events.getUniqueId('list-item-checked')
};


/**
 * @param {wap.bootcamp.common.ui.ListItem} listItem
 * @constructor
 * @extends {goog.events.Event}
 */
wap.bootcamp.common.ui.SelectableListPlugin.ItemSelectEvent = function(listItem) {
  goog.base(this, wap.bootcamp.common.ui.SelectableListPlugin.EventType.ITEM_SELECT, listItem);
};
goog.inherits(wap.bootcamp.common.ui.SelectableListPlugin.ItemSelectEvent, goog.events.Event);
