# adonis-queue
An addon/plugin package to provide driver-based job queueing services in AdonisJS 4.0+

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coveralls][coveralls-image]][coveralls-url]

<img src="http://res.cloudinary.com/adonisjs/image/upload/q_100/v1497112678/adonis-purple_pzkmzt.svg" width="200px" align="right" hspace="30px" vspace="140px">

## Getting Started
```bash

    adonis install adonisjs-queue

```

## Usage

>Add a job file to the jobs folder using the command. The command below creates the file `app/Jobs/SendEmail.js`

```bash

    $ adonis make:job SendEmail

```

```js

const Job = use('Job')
const Mail = use('Mail')

class SendEmail extends Job {

	static get driver() {
		return 'redis'
	}
	
    	static get queue(){
		return 'low'
    	}
    
	constructor(emailAddress, emailFrom, emailSubject, emailBody) {
		super(arguments)

		this.timeOut = 50; // seconds
		this.retryCount = 3;
		this.retryUntil = 200; // seconds
	}

	async handle(link, done) {
		//....
		console.log(`Job [${this.constructor.name}] - handler called: status=running; id=${this.id} `)
    
		link.reportProgress(18)

		let _data = link.data // arguments passed into the constructor
		let error = null
		let result = null

		try{
			result = await Mail.send(_data.emailBody, {gender:'F', fullname:"Aisha Salihu"}, (message) => {
				message.to(_data.emailAddress) 
				message.from(_data.emailFrom) 
				message.subject(_data.emailSubject)
			})
		}catch(err){
			error = err
		}finally{

			//...
			link.reportProgress(98)
			
			return error || result
		}
	}

	failed(link, error) {
    
		console.log(`Job [${this.constructor.name}] - status:failed; id=${this.id} `, error)
	}
	
	retrying(link, error){
	
		console.log(`Job [${this.constructor.name}] - status:retrying; id=${this.id} `, error)
	}
}

module.exports = SendEmail

```

>Open the `start/events.js` file of an **AdonisJS Framework** installation and add the following code to it (This package encourages the use of the standard event bus for **AdonisJS**)

```js

'use strict'

const Event = use('Event')
const Queue = use('Queue')

const SendEmail = use('App/Jobs/SendEmail')

Event.on('user_registered', async () => {
    await Queue.select('high').andDispatch(new SendEmail(
    	'queensaisha04@gmail.com',
	'support@example.com',
	'YOU ARE WELCOME',
	'emails.template' // AdonisJS view template file in "resources/views"
    ))
})

```

>You can also access the queue instance via the http context in a controller/middleware

```js

'use strict'

const SendEmail = use('App/Jobs/SendEmail')

class WorksController {

	async sendEmail({ request, queue, session }){
	
		let tenant_id = session.get('tenant_id')
		
		let email = request.only([
			'email'
		])
		
		await queue.dispatch(new SendEmail(
			email,
			'support@example.com',
			'YOU ARE WELCOME',
			'emails.template' // AdonisJS view template file in "resources/views"
		))
	}
}

module.exports = WorksController

```

## License

MIT

## Running Tests
```bash

    npm i

```

```bash

    npm run lint
    
    npm run test

```

## Credits

- [Ifeora Okechukwu <Head Of Technology - Oparand>](https://twitter.com/isocroft)
- [Ahmad Aziz <Head - NodeJS Foundation>](https://instagram.com/dev_amaz)

## Contributing

See the [CONTRIBUTING.md](https://github.com/stitchng/adonis-queue/blob/master/CONTRIBUTING.md) file for info

[npm-image]: https://img.shields.io/npm/v/adonisjs-queue.svg?style=flat-square
[npm-url]: https://npmjs.org/package/adonisjs-queue

[travis-image]: https://img.shields.io/travis/stitchng/adonis-queue/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/stitchng/adonis-queue

[coveralls-image]: https://img.shields.io/coveralls/stitchng/adonis-queue/develop.svg?style=flat-square

[coveralls-url]: https://coveralls.io/github/stitchng/adonis-queue
