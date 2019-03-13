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
		return 'main'
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
    
		link.reportProgress(10)

		let _data = this

		await Mail.send(_data.emailBody, {gender:'F', fullname:"Aisha Salihu"}, (message) => {
			message.to(_data.emailAddress) 
			message.from(_data.emailFrom) 
			message.subject(_data.emailSubject)
		})

		//...
		link.reportProgress(100)
	}

	async failed(error) {
    
		console.log(`Job [${this.constructor.name}] - status:failed; id=${this.id} `, error)
	}
}

module.exports = SendEmail

```

>Open the `start/events.js` file of an **AdonisJS Framework** installation and add the following code to it (This package makes use of the standard event bus for **AdonisJS**)

```js

'use strict'

const Event = use('Event')
const Queue = use('Queue')

const SendEmail = use('App/Jobs/SendEmail')

Event.on('user_registered', async () => {
    let job = await Queue.dispatch(new SendEmail(
    
    ))
})

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
