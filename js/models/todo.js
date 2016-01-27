/*global define*/
define([
	'underscore',
	'backbone'
], function (_, Backbone) {
	'use strict';

	var Todo = Backbone.Model.extend({
		// Default attributes for the todo
		// and ensure that each todo created has `title` and `completed` keys.
		defaults: {
			title: '',
			completed: false,
			priority: false
		},

		// Toggle the `priority` state of this todo item.
		togglePriority: function () {
			this.save({
				priority: !this.get('priority')
			});
			console.log(priority);
		},

		// Toggle the `completed` state of this todo item.
		toggle: function () {
			this.save({
				completed: !this.get('completed')
			});
		}
	});

	return Todo;
});
