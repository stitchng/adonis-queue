'use strict'

/*
 * adonis-queue
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const test = require('japa')
const { Config, Logger } = require('@adonisjs/sink')
const { ioc } = require('@adonisjs/fold')
const QueueManager = require('../src/Queue/Manager.js')
const QueueProvider = require('../providers/QueueProvider.js')
const JobProvider = require('../providers/JobProvider')
const Queue = require('../src/Queue/index.js')
const Job = require('../src/Job/index.js')

test.group('AdonisJS Queue Provider Test(s)', (group) => {
  group.before(() => {
    ioc.singleton('Adonis/Src/Config', () => {
      let config = new Config()
      config.set('queue.driver', 'redis')
      config.set('queue.redis', {})
      config.set('queue.rabbitmq', {})
      return config
    })

    ioc.singleton('Exception', () => {
      return {
        handlers: {},
        handle (errName, errHandler) {
          this.handlers[errName] = errHandler
        }
      }
    })

    ioc.singleton('Logger', () => {
      return new Logger()
    })

    ioc.singleton('Adonis/Src/HttpContext', () => {
      return {
        request: {},
        response: {},
        params: {},
        getter (name, callback) {
          this[name] = callback()
        }
      }
    })
  })

  test('queue provider instance registers instance(s) as expected', async (assert) => {
    let provider = new QueueProvider(ioc)
    provider.register()

    assert.instanceOf(ioc.use('Adonis/Addon/Queue'), Queue)
    assert.instanceOf(ioc.use('Adonis/Src/Queue'), QueueManager)
  })

  test('job provider instance registers instance(s) as expected', async (assert) => {
    let provider = new JobProvider(ioc)
    provider.register()

    assert.instanceOf(ioc.use('Adonis/Src/Job'), Job)
  })
})
