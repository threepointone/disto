build:
	rm -rf ./lib
	babel src -d lib

test:
	npm test

size: build
	browserify ./index.js | uglifyjs -m -c | gzip | wc -c

.PHONY: build test size