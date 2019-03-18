'use strict'

/*
 * adonis-queue
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const { ioc } = require('@adonisjs/fold')
const GE = require('@adonisjs/generic-exceptions')
const drivers = require('./Drivers')

/**
 * The queue manager class is exposed as IoC container
 * binding, which can be used to add new driver and
 * get an instance of a given driver.
 *
 * @namespace Adonis/Src/Queue
 * @manager Adonis/Src/Queue
 * @singleton
 * @group Http
 *
 * @class Manager
 */
class Manager {
  constructor () {
    this._drivers = {}
  }

  /**
   * Method called by ioc when someone extends the queue
   * manager to add their own driver
   *
   * @method extend
   *
   * @param  {String} key
   * @param  {Class} implementation
   *
   * @return {void}
   */
  extend (key, implementation) {
    this._drivers[key] = implementation
  }

  /**
   * Makes the instance of driver
   *
   * @method makeDriverInstance
   *
   * @param  {String}           name
   *
   * @return {Object}
   */
  makeDriverInstance (name) {
    const driver = drivers[name] || this._drivers[name]
    if (!driver) {
      throw GE
        .InvalidArgumentException
        .invoke(`${name} is not a valid queue driver`, 500, 'E_INVALID_QUEUE_DRIVER')
    }
    return ioc.make(driver)
  }
}

module.exports = new Manager()
