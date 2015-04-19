BABELOPTS = -t [babelify --stage 1] -t envify

dev: 
	beefy _example/app.js _simple/index.js _rebound/index.js -- $(BABELOPTS)

size:
	browserify index.js -s disto $(BABELOPTS) | uglifyjs -m -c | gzip | wc -c 

tests: 	
	npm test

.PHONY: dev size tests