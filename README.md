# Matcap Editor

[![Github](https://img.shields.io/github/stars/wanadev/matcap-editor?label=Github&logo=github)](https://github.com/wanadev/matcap-editor)
[![License](https://img.shields.io/github/license/wanadev/matcap-editor)](https://github.com/wanadev/matcap-editor/blob/master/COPYING)
[![Discord](https://img.shields.io/badge/chat-Discord-8c9eff?logo=discord&logoColor=ffffff)](https://discord.gg/BmUkEdMuFp)


>  Create and edit your matcap


**THIS PROJECT IS CURRENTLY WORK IN PROGRESS**


## Usage

Everything runs in Docker — no local Node.js installation required.

```
docker compose up -d
```

The dev server (Vite, with HMR) is then available at http://localhost:5174

Other commands run inside the container:

```
docker compose exec app npm run build       # production build, outputs to dist/
docker compose exec app npm run lint
docker compose exec app npm run type-check
docker compose exec app npm install <pkg>   # add a dependency
docker compose logs -f app                  # follow the dev server output
docker compose down                         # stop
```

Rebuild the image after changing `package.json` or the `Dockerfile`:

```
docker compose up -d --build
```

The host port defaults to `5174` (5173, the Vite default, is often already
taken). Override it with the `DEV_PORT` environment variable:

```
DEV_PORT=3005 docker compose up -d
```

## Requirement

Docker with the Compose plugin. The image is based on `node:20-alpine`.

## Contributing

### Questions

If you have any question, you can:

* [open an issue](https://github.com/wanadev/matcap-editor/issues>) on Github,
* or [ask on Discord](https://discord.gg/BmUkEdMuFp>).

### Bugs

If you found a bug, please [open an issue](https://github.com/wanadev/matcap-editor/issues) on Github with as much information as possible:

* Version of Matcap Editor you are using,
* How you built it or from which website you are using it,
* All the logs and message outputted by the software,
* ...

### Pull Requests

Please consider [filing a bug](https://github.com/wanadev/matcap-editor/issues>) before starting to work on a new feature. This will allow us to discuss the best way to do it. This is of course not necessary if you just want to fix some typo or small errors in the code.

Please note that your code must pass tests and follow the coding style (To be defined).

### Running The Tests / Linting

TODO


## Changelog

* **[NEXT]** (changes on `master` but not released yet):

  * Nothing yet
