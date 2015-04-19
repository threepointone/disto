BABELOPTS = -t [babelify --stage 1] -t envify
DEV = _rest/app.js _simple/index.js _rebound/index.js

dev: 
	open http://localhost:9966
	beefy $(DEV) -- $(BABELOPTS) 
	
size:
	browserify index.js $(BABELOPTS) | uglifyjs -m -c | gzip | wc -c 

tests: 	
	npm test

.PHONY: dev size tests