/* 
* @Author: kasperjensen
* @Date:   2014-01-19 00:38:10
* @Last Modified by:   kasperjensen
* @Last Modified time: 2014-01-20 20:23:18
*/

define(['Backbone'], function(Backbone) {
	var IOModelCollection = Backbone.Collection.extend({
		io:null,
		name:'IOModel',

		/**
		 * Add event listeners so we can send data to the client
		 * whenever the collection of the models change
		 * 
		 * @param  Array item
		 * @param  Socket.io io
		 * @param  String name
		 * @return void
		 */
		initialize:function(items, io, name) {
			this.io = io;
			this.name = name ? name:this.name;

			this.on('add', this.sendAdd);
			this.on('remove', this.sendRemove);
			this.on('change', this.sendChange);
		},

		/**
		 * Listen on a socket for when it sends data
		 * and do some CRUD
		 * 
		 * @param  Socket socket
		 * @return void
		 */
		listenOnSocket:function(socket) {
			var self = this;

			socket.on('add:' + this.name, function(data) {self.onRecieveAdd(data);} );
			socket.on('remove:' + this.name, function(data) {self.onRecieveRemove(data);} );
			socket.on('change:' + this.name, function(data) {self.onRecieveChange(data);} );
			socket.on('find:' + this.name, function(data) {self.sendList(socket, data);} );
		},

		/**
		 * Add a model to the collection upon socket/client request
		 * 
		 * @param  Object data
		 * @return void
		 */
		onRecieveAdd:function(data) {
			data instanceof Array || (data = [data]);
			var self = this;

			console.log('RECIEVE - add(' + data.length + '):' + this.name);

			var models = [];
			data.forEach(function(dat){
				var model = new self.model(dat.attributes);
				models.push(model);
			});

			this.add(models, { silent:true });
			this.sendAdd(models);
		},

		/**
		 * Remove a model from the collection upon socket/client request
		 * @param  Object data
		 * @return void
		 */
		onRecieveRemove:function(data) {
			console.log('RECIEVE - remove:' + this.name);
			this.remove([data.cid]);
		},

		/**
		 * Change a model of the collection upon socket/client request
		 * @param  Object data
		 * @return void
		 */
		onRecieveChange:function(data) {
			console.log('RECIEVE - change:' + this.name);
			var model = this.get(data.cid);
			model.set(data.attributes);
		},

		
		/**
		 * Sends all the model data to a specific client/socket 
		 * @param  Socket  socket
		 * @return void
		 */
		sendList:function(socket, data) {
			console.log('send:list:' + this.name);
			var data = [];
			for(var model in this.models) {
				data.push({cid:this.models[model].cid, attributes:this.models[model].attributes});
			}

			socket.emit('add:' + this.name, data);
		},

		/**
		 * Sends to all sockets/clients when a new item is added
		 * @param  Model model
		 * @return void
		 */
		sendAdd:function(models) {
			models instanceof Array || (models = [models]);
			console.log('send:add(' + models.length + '):' + this.name);

			var data = [];
			models.forEach(function(model){
				data.push({cid:model.cid, attributes:model.attributes});
			});

			this.io.sockets.emit('add:' + this.name, data);
		},

		/**
		 * Sends to all sockets/clients when a new item is removed
		 * @param  Model model
		 * @return void
		 */
		sendRemove:function(model) {
			console.log('send:remove:' + this.name);
			this.io.sockets.emit('remove:' + this.name, {cid:model.cid});
		},

		/**
		 * Sends to all sockets/clients when a new item is changed
		 * @param  Model model
		 * @return void
		 */
		sendChange:function(model) {
			console.log('send:change:' + this.name);
			this.io.sockets.emit('change:' + this.name, {cid:model.cid, attributes:model.attributes});
		}
	});

	return IOModelCollection;
});