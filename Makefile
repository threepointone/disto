dev: 
	beefy example/app.js -- -t [babelify --stage 0] -t envify
simple: 
	beefy simple/index.js -- -t [babelify --stage 0] -t envify

tests: 	
	mocha tests.js
.PHONY: dev tests simple