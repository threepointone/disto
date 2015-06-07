build:
	rm -rf ./lib
	babel src -d lib

test:
	npm test

size: build
	browserify ./index.js | uglifyjs -m -c | gzip | wc -c

cover:
	istanbul cover node_modules/.bin/_mocha

dev:
	babel-node server.js

hot:
	HOT=1 make dev

.PHONY: build test size dev cover