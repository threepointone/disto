build:
	rm -rf ./lib
	./node_modules/.bin/babel src -d lib

test:
	npm test

size: build
	NODE_ENV=production browserify ./index.js | uglifyjs -m -c | gzip | wc -c

cover:
	istanbul cover node_modules/.bin/_mocha

dev:
	./node_modules/.bin/babel-node server.js

hot:
	HOT=1 make dev

.PHONY: build test size dev cover