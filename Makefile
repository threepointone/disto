dev: 
	beefy example/app.js -- -t [babelify --stage 0] -t envify

simple: 
	beefy simple/index.js -- -t [babelify --stage 0] -t envify

build: 
	browserify index.js -s disto -t [babelify --stage 0] -t envify | uglifyjs -m -c > build.js

tests: 	
	mocha tests.js

.PHONY: dev tests simple