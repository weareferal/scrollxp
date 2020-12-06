# Development

## Run Local

To get it up and running for development porposes, run:

```
$ npm install
```

Then:

```
$ npm run start
```

Then access `http://localhost:3000`

## Release

It's not necessary to run `npm run compile` nor `npm run bundle` first.

To release, just commit all changes then run `npm run release`.

## To Do

There are still **a ton** of work to do here, below are just a few of them:

- [ ] Clean up the library by joining Scene + ScrollScene and Controller + ScrollController
- [ ] Fix listeners not getting removed properly
- [ ] Allow parallax registering
- [ ] Add CI
- [ ] Add scene property `data-scene-offset`
- [ ] Add scene property `data-scene-log-level`
- [ ] Add more animation options
- [ ] Support more parameters on custom scenes
