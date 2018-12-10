'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class QueueProvider extends QueueProvider {
  register () {
    this.app.singleton('Adonis/Addons/BugSnag', () => {
      const Config = this.app.use('Adonis/Src/Config')
      const QueueHelper = require('../src/RedisQueue')
      return new QueueHelper(require('bee-queue'), Config)
    })
  }
}

module.exports = QueueProvider
