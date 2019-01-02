'use strict'

/**
 * adonis-redis-queue
 *
 * @license MIT
 * @copyright Slynova - Romain Lanz <romain.lanz@slynova.ch>
 * @extended Oparand - Ifeora Okechukwu <isocroft@gmail.com> | Aziz Abdul <>
 */

const path = require('path')

module.exports = async function (cli) {
  await cli.makeConfig('queue.js', path.join(__dirname, './config/queue.js'))
    .catch((e) => {})
    
  cli.command.completed('create', 'config/queue.js')
}
