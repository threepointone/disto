DEV = _rest/app.js _simple/index.js _rebound/index.js

dev:
	open http://localhost:9966/_rest/
	beefy $(DEV) -- -t [babelify --stage 1]

build:
	babel index._.js --stage 1 > index.js
	babel mix._.js --stage 1 > mix.js

size:
	browserify index.js -t babelify | uglifyjs -m -c | gzip | wc -c

tests:
	npm test

.PHONY: dev size tests