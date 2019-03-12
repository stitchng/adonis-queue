# adonis-redis-queue
An addon/plugin package to provide Redis based queueing services in AdonisJS 4.0+

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coveralls][coveralls-image]][coveralls-url]

<img src="http://res.cloudinary.com/adonisjs/image/upload/q_100/v1497112678/adonis-purple_pzkmzt.svg" width="200px" align="right" hspace="30px" vspace="140px">

## Getting Started
```bash

    adonis install adonisjs-redis-queue

```

## Usage

>Add a job file to the jobs folder using the command. The command below creates the file `app/Jobs/EmailSender.js`

```bash

    $ adonis make:job EmailSender

```

>Open the `start/events.js` file of an **AdonisJS Framework** installation and add the following code to it (This package makes use of the standard event bus for **AdonisJS**)

```js

'use strict'

const Event = use('Event')
const Queue = use('Queue')

Event.on('user_registered', async () => {
    let job = await Queue.dispatch(new EmailSender(
    
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

See the [CONTRIBUTING.md](https://github.com/stitchng/adonis-redis-queue/blob/master/CONTRIBUTING.md) file for info

[npm-image]: https://img.shields.io/npm/v/adonisjs-redis-queue.svg?style=flat-square
[npm-url]: https://npmjs.org/package/adonisjs-redis-queue

[travis-image]: https://img.shields.io/travis/stitchng/adonis-redis-queue/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/stitchng/adonis-redis-queue

[coveralls-image]: https://img.shields.io/coveralls/stitchng/adonis-redis-queue/develop.svg?style=flat-square

[coveralls-url]: https://coveralls.io/github/stitchng/adonis-redis-queue
