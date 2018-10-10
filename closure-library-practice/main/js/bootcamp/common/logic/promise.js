goog.provide('wap.bootcamp.common.logic.promise');

goog.require('goog.Promise');

goog.scope(function() {
  var promise = wap.bootcamp.common.logic.promise;

  /**
   * returns a promise which will be rejected after a given time of milliseconds
   * @param {number} milliseconds a time period to timeout
   * @param {string|Error} error an error or an error message
   * @return {goog.Promise<T>}
   * @template T
   */
  promise.timeout = function(milliseconds, error) {
    return new goog.Promise(function(resolve, reject) {
      setTimeout(function() {
        reject(error);
      }, milliseconds);
    });
  };


  /**
   * Redirect result value or error of goog.Promise to goog.promise.Resolver
   * @param {goog.Promise.<T>} promise
   * @param {goog.promise.Resolver.<T>} resolver
   * @return {goog.Promise.<T>} newly created promise. The promise will always be fulfilled
   * even if the argument promise is rejected.
   * If the argument promise is rejected, the value of result promise will be undefined.
   * @template T
   */
  promise.redirect = function(promise, resolver) {
    return promise
      .then(function(result) {
        resolver.resolve(result);
        return result;
      })
      .thenCatch(function(error) {
        resolver.reject(error);
        return (void 0);
      });
  };
});
