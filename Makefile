build:
	rm -rf ./lib
	babel src -d lib

test:
	npm test

size: build
	browserify ./index.js | uglifyjs -m -c | gzip | wc -c

cover:
	istanbul cover node_modules/.bin/_mocha -- -R spec

dev:
	babel-node server.js

.PHONY: build test size dev cover