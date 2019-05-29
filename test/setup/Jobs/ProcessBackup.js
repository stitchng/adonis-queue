'use strict'

const Job = require('../../../src/Job/index.js')

class ProcessBackup extends Job {
  constructor (backupName) {
    super(arguments)

    this.timeOut = 10
  }

  async handle (link, done) {
    // ....
    console.log(`Job [${this.constructor.name}] - handler called: status=running; id=${this.id} `)
  }
}

module.exports = ProcessBackup
