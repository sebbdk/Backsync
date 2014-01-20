/* 
* @Author: kasperjensen
* @Date:   2014-01-19 02:02:41
* @Last Modified by:   kasperjensen
* @Last Modified time: 2014-01-19 23:59:48
*/


/**
 * RequireJS configuration
 * 
 * Configure libraries for used with 
 * requirejs AMD(Asynchronous Module Definition) style loading
 */
requirejs.config({
	shim:{
		'backbone': {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone'
		},
		'underscore': {
			exports: '_'
		},
		'socketio': {
			exports: 'io'
		}
	},
	baseUrl:'js/Lib',
	paths: {
		'jquery':'../vendor/jquery/jquery',
		'underscore':'../vendor/underscore-amd/underscore',
		'backbone':'../vendor/backbone-amd/backbone',
		'socket.io':'http://localhost:9001/socket.io/socket.io'
	},
});

/**
 * App example
 * 
 * A simple app that shares a message collection accross models
 */
requirejs(['socket.io', 'IOClientModelCollection', 'backbone'], function(io, IOClientModelCollection, Backbone) {
	var socket = io.connect('http://localhost:9001');

	//magic here! - create a new socket collection 
	//and put "messages" that you recieve from the server into it
	var messages = new IOClientModelCollection([], socket, 'messages');

	//handles when the client connects
	//will be called again after a re-connect
	socket.on('connect', function() {
		messages.sync();//syncronise the collection with the server

		//make the collection availeble 
		//for play in the window console
		window.messages = messages;
	});
});