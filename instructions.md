## Registering provider

Like any other provider, you need to register the provider inside `start/app.js` file.

```js
const providers = [
  ...
  'adonisjs-queue/providers/QueueProvider',
  'adonisjs-queue/providers/JobProvider'
]
```
Also, you need to register the provider for job
commands via ace inside the same `start/app.js` file.

```js

const aceProviders = [
  ...
  'adonisjs-queue/providers/JobCommandsProvider'
]
```

## Config

The configuration is saved inside `config/queue.js` file. Tweak it accordingly.

## Docs

To find out more, read the docs [here](https://github.com/stitchng/adonis-queue).
