all: build

build:
	npx tsc -p tsconfig.json
	npx tsc src/actor.ts

eslint:
	npx eslint src test

test:
	NODE_OPTIONS="$$NODE_OPTIONS --experimental-vm-modules" npx jest -c jest.config.ts

run:
	npx tsc
	node dist/src/scriptsTS/world.js

watch:
	npx tsc -w -p tsconfig.json

clean:
	rm -f *~ src/*~ src/*/*~ test/*~ html/*~
	rm -rf dist/*

.PHONY: all archive build clean eslint parcel test run watch
