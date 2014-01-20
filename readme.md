# BackSync
A project template for creating socket.io applications.

The app uses Backbone to syncronise data between clients and server
essentially taking the brunt out the data-exchange when doing multi-user applications

See the examples in the client and server folder for how to use
And read the code comments for documentation.

## Run the example
Download the source code and run the server/main.js
then simply open up the client/index.html in a few browser tabs.

you should now be able to use commands in the browser console and 
see the changes printed back to you in the tabs that has the application open.

##add a new item to the global items
```javascript
	messages.add([{test:'hello world'}, {test:'hello world'}]);
```

##add remove a item
```javascript
	messages.remove(messages.last());
```

##get the number of messages
```javascript
	messages.length
```

##edit a model in the collection
```javascript
	var model = messages.last();
	model.set({test:'something!'});
```