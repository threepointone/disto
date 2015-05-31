build:
	rm -rf ./lib
	babel src -d lib

tests:
	npm test

.PHONY: build tests