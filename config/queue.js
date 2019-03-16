'use strict';

const Env = use('Env');

module.exports = {
    high:{
        prefix: 'main-',
        stallInterval: 5000,
        nearTermWindow: 1200000,
        delayedDebounce: 1000,
        redis: {
            host: '127.0.0.1',
            port: 6379,
            db: 1,
            options: {}
        },
        isWorker: true,
        getEvents: true,
        sendEvents: true,
        storeJobs: true,
        ensureScripts: true,
        activateDelayedJobs: true,
        removeOnSuccess: true,
        removeOnFailure: false,
        redisScanCount: 100
    },
    low:{
        prefix: 'main-',
        stallInterval: 8000,
        nearTermWindow: 1200000,
        delayedDebounce: 2000,
        redis: {
            host: '127.0.0.1',
            port: 6379,
            db: 2,
            options: {}
        },
        isWorker: true,
        getEvents: true,
        sendEvents: true,
        storeJobs: true,
        ensureScripts: true,
        activateDelayedJobs: true,
        removeOnSuccess: true,
        removeOnFailure: false,
        redisScanCount: 150
    }
};
