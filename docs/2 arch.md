The following is proposed architecture for building front end applications based on these principles


actions
---
- consts, ideally with a label
- eg 1: 'SEARCH-INPUT', 'SEARCH-QUERY', 'SEARCH-QUERY-DONE'
- eg 2: 'form.submit', 'mousemove', 'esc-key'
- try to be consistent in style
- OG flux says that actions should be a string, but that implies a global namespace with potential clashes. I'd recommend unique objects that implement .toString() for debugging. 



messages
---
- consists of [action, ...args]
- eg. ['search-query', 'red shoes', {cache:true}]
- eg. ['login.form.submit', {username:'sunil.pai', password:'hunter2'}]

action creators
---
- functions that dispatch messages based on input. 
- this is the primary interface to trigger changes in your application.
- *knows* the dispatcher
- *knows* store states in runtime



stores
---

- is defined as a reduce function with every `message` that flows through the system
- thus, has to opt *out* of listening to a message, not opt in
- *knows* actions when starting up 
- *knows* other store states, waitFor in runtime
- *can't* access action creators, views, dispatch*, stores
- *can't* call any externally mutatory functions, except for waitfor
- thus *can't* set state on any other store

dispatcher
---
*THE* central pipe in the app into which all messages must flow. It has four functions.


- `.register(store)`: 
	ensures `store` gets all dispatched messages. For small apps, you usually want to register all available stores.
- `.unregister(store)`: 
	removes a store from the message stream. This is useful for SSR, and 
- `.dispatch(action, ...args)`: 
	dispatches a message to all registered stores
- `.waitFor(s1, s2, s3)`: 
	synchronously waits for stores to finish processing a message before proceeding.



app lifecycle
---
- main()
- asset loading (js/css/img)
- creators are decoupled from views, so eg. you can load react later
- $.bootstrap()

- full stack flux (ala petehunt at reactconf)

