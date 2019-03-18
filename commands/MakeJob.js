'use strict'

const Base = require('./Job/Base')

class MakeJob extends Base {
  /**
   * The command signature
   *
   * @method signature
   *
   * @return {String}
   */
  static get signature () {
    return `
    make:job 
    { name: Name of the job }`
  }

  /**
   * The command description
   *
   * @method description
   *
   * @return {String}
   */
  static get description () {
    return 'Make a new job to be queued'
  }

  /**
   * Handle method executed by ace
   *
   * @method handle
   *
   * @param  {String} name < Destructure args >
   * @param  {Object} options
   *
   * @return {void}
   */
  async handle ({ name }, options) {
    try {
      await this.ensureInProjectRoot()
      await this.generateBlueprint('job', name)
    } catch ({ message }) {
      this.error(message)
    }
  }
}

module.exports = MakeJob
