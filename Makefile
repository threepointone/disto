BABELOPTS = -t [babelify --stage 1] -t envify

dev: 
	beefy _rest/app.js _simple/index.js _rebound/index.js -- $(BABELOPTS)

size:
	browserify index.js $(BABELOPTS) | uglifyjs -m -c | gzip | wc -c 

tests: 	
	npm test

.PHONY: dev size tests