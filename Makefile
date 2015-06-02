build:
	rm -rf ./lib
	babel src -d lib

tests:
	npm test

size:
	browserify ./index.js | uglifyjs -m -c | gzip | wc -c

.PHONY: build tests size