'use strict'

const bqScripts = require('bee-queue/lib/lua')

class Queue {
  constructor (qManager, Exception, Config) {
    this.manager = qManager

    this._jobUuid = 0
    this._queuesPool = {}
    this._currentlySelectedQueueName = null
    this._dispatchReady = false

    this.getSetDriver = () => {
      return Config.get(`queue.driver`)
    }

    this.getDriverUrl = () => {
      let driver = this.getSetDriver()
      return Config.get(`queue.${driver}.url`)
    }

    this.getByName = (name) => {
      let driver = this.getSetDriver()
      return Config.get(`queue.${driver}.${name}`)
    }

    Exception.handle('HttpException', async () => {
      try {
        let that = this
        let uponDestroy = that.destroyAll()

        await uponDestroy.then($ => {
          that._queuesPool = {}
          that._jobUuid = 0
        })
      } catch (err) {
        console.error('@@adonisjs/Queue: Adonis Queue failed to shut down properly', err)
      }
    })
  }

  select (name, driver) {
    if (!name) {
      name = 'high'
    }

    if (!driver) {
      driver = this.getSetDriver()
    }

    let _queue = this._queuesPool[name]

    if (!_queue || !!_queue.handler) {
      _queue = this.manager.makeDriverInstance(driver, (DriverClass) => {
        return new DriverClass(
          (driver === 'redis' ? name : this.getDriverUrl()),
          this.getByName(name)
        )
      })

      switch (driver) {
        case 'redis':
          _queue.on('ready', () => {
            console.log(`@@adonisjs/Queue: [Redis] Queue [${name}] now ready`)
          })
          _queue.on('error', (err) => {
            console.error(`@@adonisjs/Queue: [Redis] Queue [${name}] cannot be ready: ERROR; ${err.message}`)
          })
          break
        case 'rabbitmq':
          _queue.on('connected', () => {
            // create queues, add halders etc.
            // this will be called on every reconnection too
            console.log(`@@adonisjs/Queue: [RabbitMQ] Queue [${name}] now ready`)
          })
          break
      }

      if (driver === 'redis') {
        this._queuesPool[name] = _queue
      } else {
        ;/* this._queuesPool[name] = await _queue.createQueue(name, { durable: false }, (msg, ack) => {
              console.log(msg.content.toString());
              ack(null, 'response');
          }); */
      }
    }

    this._dispatchReady = true
    this._currentlySelectedQueueName = name
    return this
  }

  async dispatch (job) {
    return this.andDispatch(job)
  }

  async andDispatch (job) {
    if (typeof job === 'object' &&
                typeof job.handle === 'function' &&
                    typeof job.failed === 'function' &&
                          typeof job.makeArg === 'function' &&
                            typeof job.constructor === 'function') {
      if (!this._dispatchReady) {
        if (job.queue) {
          this.select(job.queue)
        } else {
          this.select() // selects the 'high' priority queue
        }
      }

      this._dispatchReady = false

      let queue = this._queuesPool[this._currentlySelectedQueueName]

      if (queue === undefined || queue === null) {
        throw new Error('@@adonisjs/Queue: no Queue provided/available (from pool) for operation')
      }

      this._jobUuid += 1

      let _name = this._currentlySelectedQueueName
      this._currentlySelectedQueueName = null

      let _job = queue.createJob(job.makeArg(job))

      job.setQueueTarget(queue)
      job.processCalled = false

      job.id = this._jobUuid
      // See: https://nodejs.org/uk/docs/guides/timers-in-node
      /* process.nextTick(() => { */
      setTimeout(function runner () {
        _job.on('failed', job.failed.bind(job))
        _job.on('succeeded', job.succeeded.bind(job))
        _job.on('retrying', job.retrying.bind(job))
        _job.on('progress', job.progress.bind(job))
        if (!runner.processCalled) {
          queue.process(job.handle.bind(job))
          runner.processCalled = true
        }
      }, 500, {})

      return _job.setId(this._jobUuid)
        .timeout(typeof job.timeOut === 'number' ? job.timeOut : 3000)
        .backoff('fixed', typeof job.retryUntil === 'number' ? job.retryUntil : 0)
        .retries(typeof job.retryCount === 'number' ? job.retryCount : 0)
        .delayUntil(typeof job.delayUntil === 'number' ? job.delayUntil : 0)
        .save(async (err, $job) => { // See: https://github.com/bee-queue/bee-queue/issues/147
          if (err) {
            console.error(`@@adonisjs/Queue: failed in creating job id=${this._jobUuid} on queue: ${_name}`)

            // Known error when redis has not all lua scripts loaded properly
            if (err.command === 'EVALSHA') {
              await bqScripts.buildCache(this.getByName(_name))
              console.info(`@@adonisjs/Queue: successfully reloaded Lua scripts into cache; retrying job creation id=${this._jobUuid}`)

              // try to create job again
              try {
                await queue.removeJob(this._jobUuid)
              } catch (ex) { $job = null } finally {
                _job = $job || queue.createJob(job.makeArg(job))

                _job.setId(this._jobUuid)
                  .timeout(job.timeOut || 0)
                  .backoff('fixed', job.retryUntil || 0)
                  .retries(job.retryCount || 2)
                  .delayUntil(job.delayUntil || 0)
                  .save()
              }
            }
          }
        })
    }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error(`@@adonisjs/Queue: [argument] instance not of type [#Job]`))
      }, 10)
    })
  }

  async destroyAll () {
    // See: https://stackoverflow.com/questions/44410119/in-javascript-does-using-await-inside-a-loop-block-the-loop/44410481

    for (let queueName in this._queuesPool) {
      if (this._queuesPool.hasOwnProperty(queueName)) {
        let queue = this._queuesPool[queueName]
        await this.close(queue)
        await this.destroy(queue)
      }
    }
  }

  async getHealthStatus () {
    let queue = this._currentlySelectedQueueName && this._queuesPool[this._currentlySelectedQueueName]

    if (queue === void 0 || queue === null) {
      throw new Error('@@adonisjs/Queue: no Queue provided/available (from pool) for operation')
    }

    this._currentlySelectedQueueName = null

    return queue.checkHealth()
  }

  async close (queue) {
    let TIMEOUT = 80 * 1000

    if (queue === void 0 || queue === null) {
      throw new Error('@@adonisjs/Queue: no Queue provided/available (from pool) for operation')
    }

    return queue.close(TIMEOUT)
  }

  async destroy (queue) {
    if (queue === void 0 || queue === null) {
      throw new Error('@@adonisjs/Queue: no Queue provided/available (from pool) for operation')
    }

    return queue.destroy()
  }
}

module.exports = Queue
