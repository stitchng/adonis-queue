'use strict'

// helper fn to get arguments for constructor
const getConstructorArgs = function (func) {
  try {
    // try to see if browser supports class syntax
    // eval('use strict"; class foo {}');  [ thanks to: http://stackoverflow.com/a/30692705/1735884 ]

    // if so, parse native class
    var beginningOfConstructor = func.constructor.toString().indexOf('constructor(')
    var endOfConstructor = func.constructor.toString().indexOf(')', beginningOfConstructor)
    var len = endOfConstructor - beginningOfConstructor
    var args = func.constructor.toString().substr(beginningOfConstructor, len).replace('constructor(', '')
  } catch (e) {
    // parse babel transpiled class
    args = func.constructor.toString().match(/function\s.*?\(([^)]*)\)/)[1] // thanks to: https://davidwalsh.name/javascript-arguments
  }

  // thanks to: https://davidwalsh.name/javascript-arguments
  var result = args.split(',').map(function (arg) {
    return arg.replace(/\/\*.*\*\//, '').trim()
  }).filter(function (arg) {
    return arg
  })

  return result
}

const attachArgsToTarget = function (func, funcArgs, box) {
  let args = getConstructorArgs(func)
  box = box || func

  args.forEach(function (arg, i) {
    box[arg] = funcArgs[i]
  })

  return box
}

class Job {
  constructor (derivedArgs) {
    this.id = null
    this._logger = null

    var _queue = null

    this.setQueueTarget = function ($queue) {
      _queue = $queue
    }

    this.getQueueTarget = function () {
      return _queue
    }

    this.getArg = function (derived) {
      return attachArgsToTarget(derived, derivedArgs)
    }
  }

  static set logger (newLogger) {
    this.prototype._logger = newLogger
  }

  async handle () {
    throw new Error('Method Invocation Invalid')
  }

  progress () {
    throw new Error('Method Invocation Invalid')
  }

  succeeded () {
    throw new Error('Method Invocation Invalid')
  }

  failed () {
    throw new Error('Method Invocation Invalid')
  }

  retrying () {
    throw new Error('Method Invocation Invalid')
  }

  async detach () {
    let queue = this.getQueueTarget()

    if ((queue !== null) && typeof queue.removeJob === 'function') {
      this._logger.info('@@adonis/Queue: removing job from queue...')
      return queue.removeJob(this.id)
    }

    return Promise.resolve(queue)
  }
}

module.exports = Job
