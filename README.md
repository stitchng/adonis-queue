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

>Add a job file to the jobs folder using the command. The command below creates the file `app/Jobs/SendEmail.js`. The queue flag in the command is for setting the queue priority channel. The queue flag has only 2 possible values:    _high_ and _low_

```bash

    $ adonis make:job SendEmail

	$ adonis make:job SendEmail --queue=low

```

>OR

```bash

	$ node ace make:job SendEmail

```

```js

const Job = use('Job')
const Mail = use('Mail')

class SendEmail extends Job {
	
	get queue(){
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
			
			if(error){
				throw error
			}
		}
		
		return result
	}

	failed(link, error) {
    
		console.log(`Job [${this.constructor.name}] - status:failed; id=${this.id} `, error)
		
		this.detach() // remove the job from the queue (when the job fails after 3 retries)
	}
	
	retrying(link, error){
	
		console.log(`Job [${this.constructor.name}] - status:retrying; id=${this.id} `, error)
	}
	
	succeeded(link){
	
		console.log(`Job [${this.constructor.name}] - status:succeeded; id=${this.id} `)
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

Event.on('user_registered', async ( _email ) => {
    await Queue.select('high').andDispatch(new SendEmail( // dispatch to the "high" priority queue
    	_email,
		'support@example.com',
		'YOU ARE WELCOME',
		'emails.template' // AdonisJS view template file:  "resources/views/emails/template.edge"
    ))
})

```

>Then, go to the `start/routes.js` file of an **AdonisJS Framework** installation and add the following code to it

```js

Route.post('user/register/:type', ({ request, params: { type }, respopnse }) => {
	const body = request.post()

	Event.fire('user_registered', 'queensaisha04@gmail.com') // Invoke the 'SendEmail' Job (to send an email) via the Event Bus

	if (request.format() === 'json') {
  		return response.status(200).json({
		  	status:'success'
		})
	}else{
		return response.send('success')
	}
})
```

## More

>You can also access the queue instance via the **AdonisJS Http Context** in a controller/middleware

```js

'use strict'

const SendEmail = use('App/Jobs/SendEmail')

class WorksController {

	async sendEmail({ request, queue, session }){
	
		let tenant_id = session.get('tenant_id')
		
		let { email } = request.only([
			'email'
		])
		
		await queue.dispatch(new SendEmail( // dispatch to the "low" priority queue
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
- [Ahmad Abdul-Aziz](https://instagram.com/dev_amaz)

## Contributing

See the [CONTRIBUTING.md](https://github.com/stitchng/adonis-queue/blob/master/CONTRIBUTING.md) file for info

[npm-image]: https://img.shields.io/npm/v/adonisjs-queue.svg?style=flat-square
[npm-url]: https://npmjs.org/package/adonisjs-queue

[travis-image]: https://img.shields.io/travis/stitchng/adonis-queue/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/stitchng/adonis-queue

[coveralls-image]: https://img.shields.io/coveralls/stitchng/adonis-queue/master.svg?style=flat-square

[coveralls-url]: https://coveralls.io/github/stitchng/adonis-queue
