BABELOPTS = -t [babelify --stage 1]
DEV = _rest/app.js _simple/index.js _rebound/index.js

dev: 
	open http://localhost:9966/_rest/
	beefy $(DEV) -- $(BABELOPTS) 
	
size:
	browserify index.js $(BABELOPTS) | uglifyjs -m -c | gzip | wc -c 

tests: 	
	npm test

.PHONY: dev size tests