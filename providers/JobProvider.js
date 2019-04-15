'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class JobProvider extends ServiceProvider {
  /**
   * Register method called by ioc container
   *
   * @method register
   *
   * @return {void}
   */
  register () {
    this.app.bind('Adonis/Src/Job', () => {
      const Logger = this.app.use('Logger')
      const Job = require('../src/Job/index.js')

      Job.logger = Logger
      return Job
    })

    this.app.alias('Adonis/Src/Job', 'Job')
  }

  /**
   * Boot the provider
   *
   * @method boot
   *
   * @return {void}
   */
  boot () {
    ;
  }
}

module.exports = JobProvider
