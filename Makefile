dev:
	babel-node dev.js

build:
	babel src -d lib

tests:
	npm test

.PHONY: dev build tests