'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class JobCommandsProvider extends ServiceProvider {
  /**
   * Registers providers for all the {queue} job related
   * commands
   *
   * @method _registerMakeJobCommand
   *
   * @return {void}
   */
  _registerMakeJobCommand () {
    this.app.bind('Adonis/Commands/Make:Job', () => require('../commands/MakeJob'))
  }

  /**
   * Register all the required job commands providers
   *
   * @method register
   *
   * @return {void}
   */
  register () {
    this._registerMakeJobCommand()
  }

  /**
   * On boot add commands with ace
   *
   * @method boot
   *
   * @return {void}
   */
  boot () {
    const ace = require('@adonisjs/ace')
    ace.addCommand('Adonis/Commands/Make:Job')
  }
}

module.exports = JobCommandsProvider
