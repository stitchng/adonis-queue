'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class QueueProvider extends ServiceProvider {

    register(){
        this.app.singleton('Adonis/Addon/Queue', () => {
              const Config = this.app.use('Adonis/Src/Config')
              const Exception = this.app.use('Exception')
              const QueueHelper = require('../src/RedisQueue')
              
              return new QueueHelper(require('bee-queue'), Exception, Config)
        })
      
        this.app.alias('Adonis/Addon/Queue', 'Queue')
    }
}

module.exports = QueueProvider
