/*global define*/
define([
	'jquery',
	'underscore',
	'backbone',
	'collections/todos',
	'views/todos',
	'text!templates/stats.html',
	'common'
], function ($, _, Backbone, Todos, TodoView, statsTemplate, Common) {
	'use strict';

	// Our overall **AppView** is the top-level piece of UI.
	var AppView = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#todoapp',

		// Compile our stats template
		template: _.template(statsTemplate),

		// Delegated events for creating new items, and clearing completed ones.
		events: {
			'keypress #new-todo':		'createOnEnter',
			'click #clear-completed':	'clearCompleted',
			'click #toggle-all':		'toggleAllComplete'
		},

		// At initialization we bind to the relevant events on the `Todos`
		// collection, when items are added or changed. Kick things off by
		// loading any preexisting todos that might be saved in *localStorage*.
		initialize: function () {
			this.allCheckbox = this.$('#toggle-all')[0];
			this.$input = this.$('#new-todo');
			this.$footer = this.$('#footer');
			this.$main = this.$('#main');
			this.$todoList = this.$('#todo-list');

			this.listenTo(Todos, 'add', this.addOne);
			this.listenTo(Todos, 'reset', this.addAll);
			this.listenTo(Todos, 'change:completed', this.filterOne);
			this.listenTo(Todos, 'filter', this.filterAll);
			this.listenTo(Todos, 'all', _.debounce(this.render, 0));

			Todos.fetch({
				reset:true,
				success: function(){
					Todos.push({title: "Add labels for sorting and filtering", completed: false, priority: false});					
					Todos.push({title: "Add colors, so people can associate different todos with each other", completed: false, priority: false});					
					Todos.push({title: "Add a trash can for recovering deleted todos", completed: false, priority: true});					
					Todos.push({title: "Expand priority feature to have more priority status e.g. High, Medium, Low", completed: false, priority: false});
					Todos.push({title: "Let users filter or sort by priority status", completed: true, priority: true});
					Todos.push({title: "Let user set priority status when creating a todo", completed: false, priority: true});
					Todos.push({"title": "Add Priority button", "completed": true, "priority": false});
					Todos.push({"title": "Add Edit button", "completed": true, "priority": false});
																				
					_.each(Todos.models, function(data){
						console.log(data);
					});
				}
			});
		},

		// Re-rendering the App just means refreshing the statistics -- the rest
		// of the app doesn't change.
		render: function () {
			var completed = Todos.completed().length;
			var remaining = Todos.remaining().length;
			var important = Todos.important().length;
			console.log("Important: " + important)

			if (Todos.length) {
				this.$main.show();
				this.$footer.show();

				this.$footer.html(this.template({
					completed: completed,
					remaining: remaining,
					important: important
				}));

				this.$('#filters li a')
					.removeClass('selected')
					.filter('[href="#/' + (Common.TodoFilter || '') + '"]')
					.addClass('selected');
			} else {
				this.$main.hide();
				this.$footer.hide();
			}

			this.allCheckbox.checked = !remaining;
		},

		// Add a single todo item to the list by creating a view for it, and
		// appending its element to the `<ul>`.
		addOne: function (todo) {
			var view = new TodoView({ model: todo });
			this.$todoList.append(view.render().el);
		},

		// Add all items in the **Todos** collection at once.
		addAll: function () {
			this.$todoList.empty();
			Todos.each(this.addOne, this);
		},

		filterOne: function (todo) {
			todo.trigger('visible');
		},

		filterAll: function () {
			Todos.each(this.filterOne, this);
		},

		// Generate the attributes for a new Todo item.
		newAttributes: function () {
			return {
				title: this.$input.val().trim(),
				order: Todos.nextOrder(),
				completed: false,
				priority: false
			};
		},

		// If you hit return in the main input field, create new **Todo** model,
		// persisting it to *localStorage*.
		createOnEnter: function (e) {
			if (e.which !== Common.ENTER_KEY || !this.$input.val().trim()) {
				return;
			}

			Todos.create(this.newAttributes());
			this.$input.val('');
		},

		// Clear all completed todo items, destroying their models.
		clearCompleted: function () {
			_.invoke(Todos.completed(), 'destroy');
			return false;
		},

		toggleAllComplete: function () {
			var completed = this.allCheckbox.checked;

			Todos.each(function (todo) {
				todo.save({
					completed: completed
				});
			});
		}
	});

	return AppView;
});
