goog.provide('wap.bootcamp.common.ui.List');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.functions');
goog.require('goog.ui.Component');
goog.require('wap.bootcamp.common.ui.ListItem');
goog.require('wap.bootcamp.common.ui.ListPlugin');


/**
 * @param {Array.<wap.bootcamp.common.ui.ListPlugin>=} opt_plugins
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper
 * @constructor
 * @extends {goog.ui.Component}
 * @template ASSOC_TYPE
 */
wap.bootcamp.common.ui.List = function(opt_plugins, opt_domHelper) {
  goog.base(this, opt_domHelper);

  /**
   * @type {Object.<string, wap.bootcamp.common.ui.ListItem.<ASSOC_TYPE>>}
   * @private
   */
  this.elementItemMap_ = null;

  /**
   * @type {Array.<wap.bootcamp.common.ui.ListPlugin>}
   * @private
   */
  this.plugins_ = opt_plugins || [];

  /**
   * @type {boolean}
   * @private
   */
  this.enabled_ = false;
};
goog.inherits(wap.bootcamp.common.ui.List, goog.ui.Component);


/** @type {string} */
wap.bootcamp.common.ui.List.CSS_CLASS = goog.getCssName('list');


/** @enum {string} */
wap.bootcamp.common.ui.List.CSS_CLASSES = {
  DISABLED: goog.getCssName('list-disabled')
};


/** @override */
wap.bootcamp.common.ui.List.prototype.canDecorate = function($element) {
  return (
    goog.base(this, 'canDecorate', $element) &&
    $element.tagName === goog.dom.TagName.UL &&
    goog.dom.classlist.contains($element, wap.bootcamp.common.ui.List.CSS_CLASS) &&
    this.plugins_.every(function(plugin) {
      return plugin.canDecorateList($element);
    })
  );
};


/** @override */
wap.bootcamp.common.ui.List.prototype.decorateInternal = function($element) {
  goog.base(this, 'decorateInternal', $element);

  this.enabled_ = !goog.dom.classlist.contains($element, wap.bootcamp.common.ui.List.CSS_CLASSES.DISABLED);
  this.plugins_
    .map(function(plugin) {
      return plugin.getCssClasses();
    })
    .forEach(function(classes) {
      goog.dom.classlist.addAll($element, classes);
    });

  this.plugins_.forEach(function(plugin) {
    plugin.decorateList(this);
  }.bind(this));

  this.elementItemMap_ = {};
  var tmpItem = new wap.bootcamp.common.ui.ListItem();
  goog.array
    .filter(this.getDomHelper().getChildren($element), function($child) {
      return tmpItem.canDecorate($child);
    }, this)
    .forEach(function($child) {
      var item = new wap.bootcamp.common.ui.ListItem();
      this.addChild(item);
      item.decorate($child);
      this.plugins_
        .filter(function(plugin) {
          return plugin.canDecorateItem(this, item);
        }.bind(this))
        .forEach(function(plugin) {
          plugin.decorateItem(this, item);
        }.bind(this));
      this.elementItemMap_[item.getElement().id] = item;
    }.bind(this));
};


/** @override */
wap.bootcamp.common.ui.List.prototype.disposeInternal = function() {
  this.forEachChild(function(listItem) {
    this.plugins_.forEach(function(plugin) {
      plugin.disposeItem(this, listItem);
    }.bind(this));
  }, this);
  this.plugins_.forEach(function(plugin) {
    plugin.disposeList(this);
  }.bind(this));
  this.elementItemMap_ = null;
  goog.base(this, 'disposeInternal');
};


/** @override */
wap.bootcamp.common.ui.List.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.getHandler().listen(
    this.getElement(),
    goog.events.EventType.CLICK,
    this.fireItemClickEvent_,
    false
  );
};


/**
 * @param {!goog.events.Event} event
 * @private
 */
wap.bootcamp.common.ui.List.prototype.fireItemClickEvent_ = function(event) {
  var item = this.elementToItem(/** @type {Element} */(event.target));
  if (!this.enabled_ || !item) {
    event.preventDefault();
    return;
  }

  var handleCompleted = this.plugins_.some(function(plugin) {
    return plugin.handleClickEvent(this, item, event);
  }.bind(this));
  if (handleCompleted) {
    event.stopPropagation();
    return;
  }

  var itemClickEvent = new wap.bootcamp.common.ui.ListItem.ItemClickEvent(item);
  this.dispatchEvent(itemClickEvent);
};


/**
 * @param {!{caption: string, associatedData: (ASSOC_TYPE|undefined)}} item
 * @return {!wap.bootcamp.common.ui.ListItem.<ASSOC_TYPE>} added item component.
 */
wap.bootcamp.common.ui.List.prototype.addItem = function(item) {
  return /** @type { !wap.bootcamp.common.ui.ListItem.<ASSOC_TYPE> } */(this.addItems([item])[0]);
};


/**
 * @param { !Array.<{caption: string, associatedData: (ASSOC_TYPE|undefined)}> } items
 * @return { !Array.<wap.bootcamp.common.ui.ListItem.<ASSOC_TYPE>> } added item components.
 */
wap.bootcamp.common.ui.List.prototype.addItems = function(items) {
  var listItems = [];
  goog.array.forEach(items, function(item) {
    var listItem = new wap.bootcamp.common.ui.ListItem(item);
    listItem.createDom();
    this.plugins_.forEach(function(plugin) {
      plugin.createDomOfItem(this, listItem, item);
    }.bind(this));
    this.addChild(listItem);
    listItems.push(listItem);
  }.bind(this));

  var domHelper = this.getDomHelper();
  goog.array.forEach(listItems, function(listItem) {
    domHelper.appendChild(this.getContentElement(), listItem.getElement());
  }.bind(this));

  goog.array.forEach(listItems, function(listItem, index) {
    listItem.decorate(listItem.getElement());
    this.elementItemMap_[listItem.getElement().id] = listItem;
    this.plugins_.forEach(function(plugin) {
      plugin.decorateItem(this, listItem, items[index]);
    }.bind(this));
  }.bind(this));
  return listItems;
};


/**
 * @param {string|wap.bootcamp.common.ui.ListItem.<ASSOC_TYPE>} item The item ID to remove or the child component itself
 */
wap.bootcamp.common.ui.List.prototype.removeItem = function(item) {
  this.plugins_.forEach(function(plugin) {
    plugin.disposeItem(this, item);
  }.bind(this));
  this.removeChild(item, true);
};


/**
 *
 */
wap.bootcamp.common.ui.List.prototype.removeAll = function() {
  // In this case, this.forEachChild will not work
  for (var i = this.getChildCount() - 1; i >= 0; i--) {
    var item = /** @type {wap.bootcamp.common.ui.ListItem.<ASSOC_TYPE>} */(this.getChildAt(i));
    this.removeItem(item);
  }
};


/**
 * @param {Element} $element
 * @return {?wap.bootcamp.common.ui.ListItem.<ASSOC_TYPE>} ListItem component which contains
 *   $element if found, otherwise null.
 * @protected
 */
wap.bootcamp.common.ui.List.prototype.elementToItem = function($element) {
  var $e = $element;
  var $base = this.getElement();
  while ($e !== $base && $e !== null) {
    var item = this.elementItemMap_[$e.id];
    if (item) {
      return item;
    }
    $e = this.getDomHelper().getParentElement($e);
  }
  return null;
};


/**
 * @return {boolean}
 */
wap.bootcamp.common.ui.List.prototype.isEnabled = function() {
  return this.enabled_;
};


/**
 * @param {boolean} enabled
 */
wap.bootcamp.common.ui.List.prototype.setEnabled = function(enabled) {
  this.enabled_ = enabled;
  goog.dom.classlist.enable(this.getElement(),
    wap.bootcamp.common.ui.List.CSS_CLASSES.DISABLED, !enabled);
};
