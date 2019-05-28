'use strict'

const Base = require('./Job/Base.js')
const INVALID_QUEUE_PARAM_MESSAGE = "invalid value for \"--queue\" flag: value is either 'high' or 'low'"

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
    { --queue=@value: Specify queue channel to be used for job dispatch }
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
   * @param  {String} name < Destructure Args >
   * @param  {Object} options
   *
   * @return {void}
   */
  async handle ({ name }, options) {
    try {
      if (!options) {
        options = {}
      }

      if (!options.queue ||
        typeof options.queue !== 'string') {
        options.queue = 'high'
      } else {
        const regexp = new RegExp('^(high|low)$', 'gm');
        if (!regexp.test(options.queue)) {
          throw new Error(INVALID_QUEUE_PARAM_MESSAGE)
        }
      }

      await this.ensureInProjectRoot()
      await this.generateBlueprint('job', name, options)
    } catch ({ message }) {
      this.error(message)
    }
  }
}

exports = module.exports = MakeJob
exports.INVALID_QUEUE_PARAM_MESSAGE = INVALID_QUEUE_PARAM_MESSAGE
