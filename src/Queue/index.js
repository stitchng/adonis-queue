'use strict'

const bqScripts = require('bee-queue/lib/lua')

class Queue {
  constructor (QueueManager, Exception, Config) {
    this.manager = QueueManager

    this._jobUuid = 0
    this._queuesPool = {}
    this._currentlySelectedQueueName = null

    this.getByName = (name) => {
      return Config.get(`queue.${name}`)
    }

    Exception.handle('HttpException', async () => {
      try {
        await this.close()
      } catch (err) {
        console.error('@@adonis/Queue: Adonis Queue failed to shut down gracefully', err)
      }
    })
  }

  select (name, driver) {
    if (!name) {
      name = 'high'
    }

    if (!driver) {
      driver = 'redis'
    }

    if (this._queuesPool[name]) {
      this._currentlySelectedQueueName = name
      return this
    }

    this._queuesPool[name] = this.manager.makeDriverInstance(driver, DriverClass => {
      return new DriverClass(name, this.getByName(name))
    })/* .on('ready', () => {
      console.log(`@@adonis/Queue: Queue [${name}] now ready`)
    }) */
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
                        typeof job.getArg === 'function' &&
                          typeof job.constructor === 'function') {
      let queue = this._currentlySelectedQueueName && this._queuesPool[this._currentlySelectedQueueName]

      if (queue === void 0 || queue === null) {
        this.select(job.constructor.queue)

        if ((queue = this._queuesPool[this._currentlySelectedQueueName]) === null) {
          throw new Error('@@adonisjs/Queue: No Queue Selected/Added To Pool')
        }
      }

      this._jobUuid += 1

      let _name = this._currentlySelectedQueueName
      this._currentlySelectedQueueName = null

      let _job = queue.createJob(job.getArg(job))

      job.setQueueTarget(queue)

      process.nextTick(() => {
        job.id = this._jobUuid
        _job.on('failed', job.failed.bind(job))
        _job.on('succeeded', job.succeeded.bind(job))
        _job.on('retrying', job.retrying.bind(job))
        queue.process(2, job.handle.bind(job))
      })

      return _job.setId(this._jobUuid)
        .timeout(job.timeOut || 0)
        .backoff('fixed', job.retryUntil || 0)
        .retries(job.retryCount || 2)
        .save(async (err, job) => { // See: https://github.com/bee-queue/bee-queue/issues/147
          if (err) {
            console.error(`@@adonisjs/Queue: failed creating job ${this._jobUuid}`)
            // Known error when redis has not all lua scripts loaded properly
            if (err.command === 'EVALSHA') {
              await bqScripts.buildCache(this.getByName(_name))
              console.info('Successfully reloaded Lua scripts into cache!')
              // create job again
              queue.createJob(job.getArg(job)).save()
            }
          }
        })
    }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error(`@@adonisjs/Queue: [argument] Instance not of type [#Job]`))
      }, 10)
    })
  }

  async destroyAll () {
    for (let queue of this._queuesPool) {
      await queue.destroy()
    }

    this._queuesPool = {}
  }

  async getHealthStatus () {
    let queue = this._currentlySelectedQueueName && this._queuesPool[this._currentlySelectedQueueName]

    if (queue === void 0 || queue === null) {
      throw new Error('@@adonis/Queue: No Queue Selected/Added To Pool')
    }

    // this._currentlySelectedQueueName = null

    return queue.checkHealth()
  }

  async close () {
    let queue = this._currentlySelectedQueueName && this._queuesPool[this._currentlySelectedQueueName]
    let TIMEOUT = 80 * 1000

    if (queue === void 0 || queue === null) {
      throw new Error('@@adonis/Queue: No Queue Selected/Added To Pool')
    }

    this._currentlySelectedQueueName = null

    return queue.close(TIMEOUT)
  }

  async destroy () {
    let queue = this._currentlySelectedQueueName && this._queuesPool[this._currentlySelectedQueueName]

    if (queue === void 0 || queue === null) {
      throw new Error('@@adonis/Queue: No Queue Selected/Added To Pool')
    }

    this._currentlySelectedQueueName = null

    return queue.destroy()
  }
}

module.exports = Queue
