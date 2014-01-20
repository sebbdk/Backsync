/* 
* @Author: kasperjensen
* @Date:   2014-01-19 16:14:10
* @Last Modified by:   kasperjensen
* @Last Modified time: 2014-01-20 20:21:18
*/

define(['backbone'], function(Backbone) {
	var IOClientModelCollection = Backbone.Collection.extend({
		socket:null,
		name:'IOModel',

		/**
		 * Add listeners so we will recieve data from the server
		 * and also so we will send the data when we change/delete/add something 
		 * in the collection and it's models
		 * 
		 * @param  Array item
		 * @param  Socket socket
		 * @param  String name
		 * @return void
		 */
		initialize:function(items, socket, name) {
			var self = this;
			this.socket = socket;
			this.name = name ? name:this.name;

			this.on('add', this.sendAdd);
			this.on('remove', this.sendRemove);
			this.on('change', this.sendChange);

			socket.on('add:' + this.name, function(data) {self.onRecieveAdd(data);} );
			socket.on('remove:' + this.name, function(data) {self.onRecieveRemove(data);} );
			socket.on('change:' + this.name, function(data) {self.onRecieveChange(data);} );
		},

		/**
		 * reset the collection and request a fresh set of data from the server
		 * 
		 * @return void
		 */
		sync:function() {
			this.reset();
			this.socket.emit('find:' + this.name);
		},

		/**
		 * Override the default add action, if it is raw objects being passed or models wihout cid's
		 * then send the models to the server instead 
		 * so the server can create proper models and give them a id
		 *
		 * Existing models with cid's will just be added as usual
		 *
		 * @param  * models
		 * @return array
		 */
		add:function(models, options) {
			if(models === undefined) {
				return [];
			}

			var addOptions = {add: true, remove: false};
			models instanceof Array || (models = [models]);

			var newModels = [];//sent to server
			var existingModels = [];//saved to model
			models.forEach(function(model){
				if(!model.cid) {
					if(model instanceof Backbone.Model) {
						newModels.push({attributes:model.attributes});
					} else {
						newModels.push({attributes:model});
					}
				} else if(model instanceof Backbone.Model){
					existingModels.push(model);
				}
			});

			if(newModels.length > 0) {
				this.socket.emit('add:' + this.name, newModels);
			}

			return this.set(existingModels,  _.extend({merge: false}, options, addOptions));
		},

		/**
		 * Add models we recieve from the server
		 * 
		 * @param  Object data
		 * @return void
		 */
		onRecieveAdd:function(data) {
			console.log('RECIEVE - add:' + this.name);
			var self = this;
			data instanceof Array || (data = [data]);

			models = [];
			data.forEach(function(dat) {
				var model = new self.model(dat.attributes);
				model.cid = dat.cid;
				models.push(model);
			});

			this.add(models, {silent: true});
		},

		/**
		 * remove models when told by the server
		 * 
		 * @param  Object data
		 * @return void
		 */
		onRecieveRemove:function(data) {
			console.log('RECIEVE - remove:' + this.name);
			this.remove(data.cid, {silent: true});
		},

		/**
		 * change models when told by the server
		 * 
		 * @param  Object data
		 * @return void
		 */
		onRecieveChange:function(data) {
			console.log('RECIEVE - change:' + this.name);
			var model = this.get(data.cid);
			model.set(data.attributes, {silent: true});
		},

		/**
		 * Tells the server to remove a model when a model has been removed locally
		 * @param  Model model
		 * @return void
		 */
		sendRemove:function(model) {
			console.log('remove:' + this.name);
			this.socket.emit('remove:' + this.name, {cid:model.cid});
		},

		/**
		 * Sends changes made to models locally to the server
		 * 
		 * @param  Model model
		 * @return void
		 */
		sendChange:function(model) {
			console.log('change:' + this.name);
			this.socket.emit('change:' + this.name, {cid:model.cid, attributes:model.changed});
		}
	});

	return IOClientModelCollection;
});