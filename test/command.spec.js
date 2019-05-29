'use strict'

const test = require('japa')
const { ioc, registrar } = require('@adonisjs/fold')
const JobCommandsProvider = require('../providers/JobCommandsProvider')

const initializeMakeJobCommand = () => {
    registrar.register()
    const provider = new JobCommandsProvider(ioc)
    provider.register()
    return ioc.use('Adonis/Commands/Make:Job')
}

test.group('Adonis make:job Command Test(s)', group => {
    group.before(() => {
        ioc.singleton('Exception', () => {
            return {
                handlers: {},
                handle (errName, errHandler) {
                    this.handlers[errName] = errHandler
                }
            }
        })
    })
          
    test('job commands provider instance registers instance(s) as expected', async (assert) => {
        assert.exists(initializeMakeJobCommand)
    })

    test('running make:job command queue param exception', async (assert) => {
        const MakeJob = initializeMakeJobCommand()
        let response = await new MakeJob().handle({ name: 'Job1' }, { queue: 'foo' })
        assert.equal(response, new MakeJob().INVALID_QUEUE_PARAM_MESSAGE)
    })

    test('running make:job command queue param set to low run(s) as expected', async (assert) => {
        const MakeJob = initializeMakeJobCommand()
        let response = await new MakeJob().handle({ name: 'Job1' }, { queue: 'low' })
        assert.equal(response, undefined)
    })

    test('running make:job command queue param set to high run(s) as expected', async (assert) => {
        const MakeJob = initializeMakeJobCommand()
        let response = await new MakeJob().handle({ name: 'Job1' }, { queue: 'high' })
        assert.equal(response, undefined)
    })
})