'use strict'

const Env = use('Env')

module.exports = {
  driver: 'redis',
  redis: {
    high: {
      prefix: 'mainh-',
      stallInterval: 5000,
      nearTermWindow: 1200000,
      delayedDebounce: 1000,
      redis: {
        host: Env.get('REDIS_HOST'), // '127.0.0.1'
        port: Env.get('REDIS_PORT'), // 6379
        db: 1,
        options: { attempt: 20 },
        retry_strategy (options) {
          return Math.min(options.attempt * 100, 3000)
        }
      },
      isWorker: true,
      getEvents: true,
      sendEvents: true,
      storeJobs: true,
      ensureScripts: true,
      maxConcurrencyJobs: 4,
      activateDelayedJobs: true,
      removeOnSuccess: true,
      removeOnFailure: false,
      redisScanCount: 100
    },
    low: {
      prefix: 'mainl-',
      stallInterval: 8000,
      nearTermWindow: 1200000,
      delayedDebounce: 2000,
      redis: {
        host: Env.get('REDIS_HOST'), // '127.0.0.1'
        port: Env.get('REDIS_PORT'), // 6379
        db: 2,
        options: { attempt: 20 },
        retry_strategy (options) {
          return Math.min(options.attempt * 100, 3000)
        }
      },
      isWorker: true,
      getEvents: true,
      sendEvents: true,
      storeJobs: true,
      ensureScripts: true,
      maxConcurrencyJobs: 4,
      activateDelayedJobs: true,
      removeOnSuccess: true,
      removeOnFailure: false,
      redisScanCount: 150
    }
  },
  rabbitmq: {
    high:{
    
    },
    low:{
    
    }
  }
}
