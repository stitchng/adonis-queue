'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class QueueProvider extends ServiceProvider {
  /**
   * Registers manager under `Adonis/Src/Queue`
   * namespace
   *
   * @method _registerManager
   *
   * @return {void}
   *
   * @private
   */
  _registerManager () {
    const Manager = require('../src/Queue/Manager.js')
    this.app.manager('Adonis/Src/Queue', new Manager({
      'redis': 'bee-queue'
    }))
  }

  /**
   * Registers provider under `Adonis/Src/Queue`
   * namespace.
   *
   * @method _registerProvider
   *
   * @return {void}
   *
   * @private
   */
  _registerProvider () {
    this.app.bind('Adonis/Src/Queue', () => {
      const Manager = require('../src/Queue/Manager.js')

      return new Manager({
        'redis': 'bee-queue'
      })
    })
  }

  /**
   * Registers instance under `Adonis/Addon/Queue`
   * namespace.
   *
   * @method _registerInstance
   *
   * @return {void}
   *
   * @private
   */
  _registerInstance () {
    this.app.singleton('Adonis/Addon/Queue', () => {
      const Config = this.app.use('Adonis/Src/Config')
      const Exception = this.app.use('Exception')
      const Queue = require('../src/Queue/index.js')

      const QueueManager = this.app.use('Adonis/Src/Queue')
      return new Queue(QueueManager, Exception, Config)
    })

    this.app.alias('Adonis/Addon/Queue', 'Queue')
  }

  /**
   * Register method called by ioc container
   *
   * @method register
   *
   * @return {void}
   */
  register () {
    this._registerManager()
    this._registerProvider()
    this._registerInstance()
  }

  /**
   * Boot the provider
   *
   * @method boot
   *
   * @return {void}
   */
  boot () {
    const HttpContext = this.app.use('Adonis/Src/HttpContext')
    const Config = this.app.use('Adonis/Src/Config')
    const QueueManager = this.app.use('Adonis/Src/Queue')

    const Exception = this.app.use('Exception')

    /**
     * Adding getter to the HTTP context. Please note the queue
     * instance...
     */
    HttpContext.getter('queue', function () { // A NEW QUEUE INSTANCE ON EVERY REQUEST [HTTP]
      let Queue = require('../src/Queue/index.js')
      // this.request, this.response
      return new Queue(QueueManager, Exception, Config)
    }, true)

    /**
     * Since Websocket is optional, we need to wrap the use
     * statement inside a try/catch and if user is using
     * websocket connection, we will initiate sessions
     * for them
     */
    try {
      const WsContext = this.app.use('Adonis/Addons/WsContext')
      WsContext.getter('queue', function () { // A NEW QUEUE INSTANCE ON EVERY REQUEST [WS]
        let Queue = require('../src/Queue/index.js')
        // this.request, this.response
        return new Queue(QueueManager, Exception, Config)
      }, true)
    } catch (error) {}
  }
}

module.exports = QueueProvider
