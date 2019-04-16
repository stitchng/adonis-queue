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
    { name: Name of the job to be queued }
    { --queue=@value: Specify queue channel to be used for dispatch }
    `
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

      if(!options){
        options = {}
      }

      if (!options.queue ||
        typeof options.queue !== 'string') {
        options.queue = 'high'
      }else{
        if(/^(?:high|low)$/.test(options.queue)){
          throw new Error("invalid value for \"--queue\" flag: value is either 'high' or 'low'")
        }
      }

      await this.ensureInProjectRoot()
      await this.generateBlueprint('job', name, options)
    } catch ({ message }) {
      this.error(message)
    }
  }
}

module.exports = MakeJob
