/* 
* @Author: kasperjensen
* @Date:   2014-01-18 23:51:21
* @Last Modified by:   kasperjensen
* @Last Modified time: 2014-01-19 18:12:31
*/

var requirejs = require('requirejs');

/**
 * RequireJS configuration
 * 
 * Configure libraries and their dependencies
 */
requirejs.config({
	shim:{
		'backbone': {
			deps: ['underscore'],
			exports: 'Backbone'
		},
		'underscore': {
			exports: '_'
		}
	},
	baseUrl:'Lib',
	paths: {},
});

/**
 * Server app example
 *
 * Set up a shared message collection
 */
requirejs(['IOModelCollection'], function(IOModelCollection) {
	var io = require('socket.io').listen(9001);
	io.set('log level', 1);//less log data please...

	var messages = new IOModelCollection([], io, 'messages');

	//handle new connections
	io.sockets.on('connection', function (socket) {
		console.log('New connection!');

		//Add CRUD event listeners to the socket
		//so the collection will react to data sent
		messages.listenOnSocket(socket);
	});
});