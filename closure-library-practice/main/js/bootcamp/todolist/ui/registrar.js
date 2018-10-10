goog.provide('wap.bootcamp.todolist.ui.Registrar');

goog.require('goog.Promise');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.string');
goog.require('goog.ui.Component');
goog.require('wap.bootcamp.common.event.AsynchronousTrialEvent');


/**
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.ui.Component}
 */
wap.bootcamp.todolist.ui.Registrar = function(opt_domHelper) {
  goog.base(this, opt_domHelper);

  /**
   * @type {Element}
   * @private
   */
  this.$text_ = null;

   /**
   * @type {Element}
   * @private
   */
  this.$addButton_ = null;

  /**
   * @type {Element}
   * @private
   */
  this.$validationErrorMessage_ = null;

  /**
   * @type {wap.bootcamp.todolist.ui.Registrar.Status}
   * @private
   */
  this.status_ = wap.bootcamp.todolist.ui.Registrar.Status.VALID;
};
goog.inherits(wap.bootcamp.todolist.ui.Registrar, goog.ui.Component);


/**
 * @enum {number}
 */
wap.bootcamp.todolist.ui.Registrar.Status = {
  VALID: 0,
  VALIDATING: 1,
  INVALID: 2,
  EMPTY: 3,
  DISABLED: 4
};

/**
 * @type {string}
 */
wap.bootcamp.todolist.ui.Registrar.CSS_CLASS = goog.getCssName('registrar');


/**
 * @enum {string}
 */
wap.bootcamp.todolist.ui.Registrar.CSS_CLASSES = {
  TEXT: goog.getCssName('registrar-text'),
  ADD_BUTTON: goog.getCssName('registrar-add-button'),
  DISABLED: goog.getCssName('registrar-disabled'),
  TEXT_HAS_ERROR: goog.getCssName('registrar-text-has-error'),
  ERROR_MESSAGE: goog.getCssName('registrar-validation-error-message')
};


/** @override */
wap.bootcamp.todolist.ui.Registrar.prototype.canDecorate = function($element) {
  return (
    goog.base(this, 'canDecorate', $element) &&
    goog.dom.classlist.contains($element, wap.bootcamp.todolist.ui.Registrar.CSS_CLASS) &&
    Boolean(this.findTextElement_($element)) &&
    Boolean(this.findAddButtonElement_($element))
  );
};


/** @override */
wap.bootcamp.todolist.ui.Registrar.prototype.decorateInternal = function($element) {
  goog.base(this, 'decorateInternal', $element);
  this.$text_ = this.findTextElement_($element);
  this.$addButton_ = this.findAddButtonElement_($element);
  this.$validationErrorMessage_ = this.findValidationErrorMessageElement_($element);
  if (goog.dom.classlist.contains($element, wap.bootcamp.todolist.ui.Registrar.CSS_CLASSES.DISABLED)) {
    this.status_ = wap.bootcamp.todolist.ui.Registrar.Status.DISABLED;
  } else if (goog.string.isEmptySafe(this.$text_.value)) {
    this.status_ = wap.bootcamp.todolist.ui.Registrar.Status.EMPTY;
  } else {
    this.status_ = wap.bootcamp.todolist.ui.Registrar.Status.VALID;
  }
};


/** @override */
wap.bootcamp.todolist.ui.Registrar.prototype.disposeInternal = function() {
  this.$text_ = null;
  this.$addButton_ = null;
  this.$validationErrorMessage_ = null;
  this.status_ = wap.bootcamp.todolist.ui.Registrar.Status.DISABLED;
  goog.base(this, 'disposeInternal');
};


/** @override */
wap.bootcamp.todolist.ui.Registrar.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.getHandler().listen(
      this.$addButton_,
      goog.events.EventType.CLICK,
      this.fireAddEvent_
  );
  this.getHandler().listen(
      this.$text_,
      goog.events.EventType.INPUT,
      this.validate_
  );
};


/**
 * @param {Element} $element
 * @return {Element}
 * @private
 */
wap.bootcamp.todolist.ui.Registrar.prototype.findTextElement_ = function($element) {
  return this.getDomHelper().getElementByClass(
    wap.bootcamp.todolist.ui.Registrar.CSS_CLASSES.TEXT, $element);
};


/**
 * @param {Element} $element
 * @return {Element}
 * @private
 */
wap.bootcamp.todolist.ui.Registrar.prototype.findAddButtonElement_ = function($element) {
  return this.getDomHelper().getElementByClass(
    wap.bootcamp.todolist.ui.Registrar.CSS_CLASSES.ADD_BUTTON, $element);
};


/**
 * @param {goog.events.Event} event
 * @private
 */
wap.bootcamp.todolist.ui.Registrar.prototype.fireAddEvent_ = function(event) {
  var addEvent = new wap.bootcamp.todolist.ui.Registrar.AddEvent(this.$text_.value);
  if (this.dispatchEvent(addEvent)) {
    this.$text_.value = '';
    this.setStatus(wap.bootcamp.todolist.ui.Registrar.Status.EMPTY);
  }
};

/**
 * @return {boolean}
 */
wap.bootcamp.todolist.ui.Registrar.prototype.isEnabled = function() {
  return this.status_ !== wap.bootcamp.todolist.ui.Registrar.Status.DISABLED;
};


/**
 * @param {boolean} enabled
 */
wap.bootcamp.todolist.ui.Registrar.prototype.setEnabled = function(enabled) {
  this.setStatus(enabled ?
      wap.bootcamp.todolist.ui.Registrar.Status.VALID :
      wap.bootcamp.todolist.ui.Registrar.Status.DISABLED);
};

/**
 * @return {wap.bootcamp.todolist.ui.Registrar.Status}
 */
wap.bootcamp.todolist.ui.Registrar.prototype.getStatus = function() {
  return this.status_;
};

/**
 * @param {wap.bootcamp.todolist.ui.Registrar.Status} status
 */
wap.bootcamp.todolist.ui.Registrar.prototype.setStatus = function(status) {
  this.status_ = status;

  switch (status) {
    case wap.bootcamp.todolist.ui.Registrar.Status.DISABLED:
      goog.dom.classlist.add(this.getElement(),
          wap.bootcamp.todolist.ui.Registrar.CSS_CLASSES.DISABLED);
      goog.dom.classlist.remove(this.$text_,
          wap.bootcamp.todolist.ui.Registrar.CSS_CLASSES.TEXT_HAS_ERROR);
      this.$text_.disabled = true;
      this.$addButton_.disabled = true;
      break;
    case wap.bootcamp.todolist.ui.Registrar.Status.EMPTY:
      goog.dom.classlist.remove(this.getElement(),
          wap.bootcamp.todolist.ui.Registrar.CSS_CLASSES.DISABLED);
      goog.dom.classlist.remove(this.$text_,
          wap.bootcamp.todolist.ui.Registrar.CSS_CLASSES.TEXT_HAS_ERROR);
      this.$text_.disabled = false;
      this.$addButton_.disabled = true;
      break;
    case wap.bootcamp.todolist.ui.Registrar.Status.VALIDATING:
    case wap.bootcamp.todolist.ui.Registrar.Status.INVALID:
      goog.dom.classlist.remove(this.getElement(),
          wap.bootcamp.todolist.ui.Registrar.CSS_CLASSES.DISABLED);
      goog.dom.classlist.add(this.$text_,
          wap.bootcamp.todolist.ui.Registrar.CSS_CLASSES.TEXT_HAS_ERROR);
      this.$text_.disabled = false;
      this.$addButton_.disabled = true;
      break;
    case wap.bootcamp.todolist.ui.Registrar.Status.VALID:
      goog.dom.classlist.remove(this.getElement(),
          wap.bootcamp.todolist.ui.Registrar.CSS_CLASSES.DISABLED);
      goog.dom.classlist.remove(this.$text_,
          wap.bootcamp.todolist.ui.Registrar.CSS_CLASSES.TEXT_HAS_ERROR);
      this.$text_.disabled = false;
      this.$addButton_.disabled = false;
      break;
  }
};

/**
 * @param {goog.events.Event} event
 * @private
 */
wap.bootcamp.todolist.ui.Registrar.prototype.validate_ = function(event) {
  var text = this.$text_.value;
  if (goog.string.isEmptySafe(text)) {
    this.setStatus(wap.bootcamp.todolist.ui.Registrar.Status.EMPTY);
    this.setErrorMessage('Title must not be empty');
    return;
  }

  var trial = goog.Promise.withResolver();
  trial.promise
      .then(function() {
        this.setStatus(wap.bootcamp.todolist.ui.Registrar.Status.VALID);
        this.setErrorMessage();
      }.bind(this))
      .thenCatch(function(error) {
        this.setStatus(wap.bootcamp.todolist.ui.Registrar.Status.INVALID);
        this.setErrorMessage(error.toString());
      }.bind(this));
  var validateEvent = new wap.bootcamp.common.event.AsynchronousTrialEvent(
      wap.bootcamp.todolist.ui.Registrar.EventType.VALIDATE, trial, text);
  if (!this.dispatchEvent(validateEvent)) {
    this.setStatus(wap.bootcamp.todolist.ui.Registrar.Status.VALIDATING);
    this.setErrorMessage('Validating...');
  } else {
    this.setStatus(wap.bootcamp.todolist.ui.Registrar.Status.VALID);
    this.setErrorMessage();
  }
};

/**
 * @param {Element} $element
 * @return {Element}
 * @private
 */
wap.bootcamp.todolist.ui.Registrar.prototype.findValidationErrorMessageElement_ = function($element) {
  return this.getDomHelper().getElementByClass(
      wap.bootcamp.todolist.ui.Registrar.CSS_CLASSES.ERROR_MESSAGE, $element);
};

/**
 * @return {?string}
 */
wap.bootcamp.todolist.ui.Registrar.prototype.getErrorMessage = function() {
  if (!this.$validationErrorMessage_) {
    return null;
  }
  return this.getDomHelper().getTextContent(this.$validationErrorMessage_);
};


/**
 * @param {?string=} opt_errorMessage
 */
wap.bootcamp.todolist.ui.Registrar.prototype.setErrorMessage = function(opt_errorMessage) {
  if (!this.$validationErrorMessage_) {
    return;
  }
  this.getDomHelper().setTextContent(this.$validationErrorMessage_, opt_errorMessage || '');
};

/**
 * @enum {string}
 */
wap.bootcamp.todolist.ui.Registrar.EventType = {
  ADD: goog.events.getUniqueId('registrar-add'),
  VALIDATE: goog.events.getUniqueId('registrar-validate')
};

/**
 * @param {string} text
 * @constructor
 * @extends {goog.events.Event}
 */
wap.bootcamp.todolist.ui.Registrar.AddEvent = function(text) {
  goog.base(this, wap.bootcamp.todolist.ui.Registrar.EventType.ADD);
  this.text = text;
};
goog.inherits(wap.bootcamp.todolist.ui.Registrar.AddEvent, goog.events.Event);
