goog.provide('wap.bootcamp.common.event.AsynchronousTrialEvent');

goog.require('goog.events.Event');
goog.require('goog.events.EventId');
goog.require('goog.promise.Resolver');


/**
 * A base class for trigger events with asynchronous trials.
 * An application will register data to its view without server response.
 * This event class is to provide developers stereotypical ways
 * to commit or rollback the 'snap decisions' and
 * push its effects to the application views.<br>
 *
 * A sample code is shown below:
 *
 * <code>
 *   Controller.prototype.saveData = function(event) {
 *     dao.save(event.data)
 *       .then(function(saved) {
 *         event.trial.resolve(saved);
 *       })
 *       .thenCatch(function(error) {
 *         event.trial.reject(error)
 *       });
 *   };
 * </code>
 *
 * You may use {@link wap.bootcamp.common.logic.promise}.redirect() method for utility:
 *
 * <code>
 *   Controller.prototype.saveData = function(event) {
 *     wap.bootcamp.common.logic.promise.redirect(
 *         dao.save(event.data), event.trial);
 *   };
 * </code>
 *
 * @param {string|!goog.events.EventId} type
 * @param {!goog.promise.Resolver.<RESULT>} trial
 * @param {TARGET=} opt_target
 * @constructor
 * @extends {goog.events.Event}
 * @template TARGET,RESULT
 */
wap.bootcamp.common.event.AsynchronousTrialEvent = function(type, trial, opt_target) {
  goog.base(this, type, opt_target);

  /** @type {!goog.promise.Resolver.<RESULT>} */
  this.trial = trial;
};
goog.inherits(wap.bootcamp.common.event.AsynchronousTrialEvent, goog.events.Event);
