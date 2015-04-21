This document is meant to be technology angnostic. The code samples here use disto purely for expression.


rationale
---
Problem: codebases/applications need to scale, in terms of -
- people
- features
- testability

This is done by -
- extracting standalone functional parts and exposing them as libraries. 
	This is a good strategy for non-runtime dependencies like service clients, language helpers, etc. These are easily testable, and usually requires few people per 'unit'.
- exposing infrastructure as a service/platform
	This consists of (dev)ops, CI/CD setups, etc. 
- composing applications with stateful services exposed over common interfaces like http. 
	This works for 'get' stuff like myntra's product/search services, but also 'post' stuff like cart services. In the application, this is usually abstracted behind service clients
- adopting patterns and imposing constraints on the architecture of the application. This is the most critical, since it establishes a tone for daily work on the codebase (as opposed to the previous 2, which have to do with how they 'run'). Some folks try to codify these patterns into so-called 'frameworks', but the idea is to use a consistent strategy to accept every new line of code.

We will talk about the last one, and later discuss how it affects all the others. 

principles
---
- [why flux]
- one way data flow 
- no cascading effects
- works well with commonjs!
- functional
- there's a pattern to adding new features/tests/people to the project
