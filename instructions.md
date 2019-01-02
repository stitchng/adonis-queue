## Registering provider

Like any other provider, you need to register the provider inside `start/app.js` file.

```js
const providers = [
  '@adonisjs/adonis-redis-queue/providers/QueueProvider'
]
```

## Config

The configuration is saved inside `config/queue.js` file. Tweak it accordingly.

## Docs

To find out more, read the docs [here](https://github.com/stitchng/adonis-redis-queue).
