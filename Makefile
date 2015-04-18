dev: 
	beefy example/app.js -- -t [babelify --stage 0] -t envify

simple: 
	beefy simple/index.js -- -t [babelify --stage 0] -t envify

build: 
	browserify index.js -s disto -t [babelify --stage 0] -t envify -o build.js
	cat build.js | uglifyjs -m -c | gzip | wc -c 

tests: 	
	mocha tests.js

.PHONY: dev tests simple