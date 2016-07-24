/**
 * easy-FilteredMasonry : Control object to handle filters on masonry.js grids
 *
 * just do your usual masonry business, then call FilteredMasonry on the same element.
 *
 *
 * @Author     Nabil Redmann (BananaAcid) <repo@bananaacid.de>
 * @Licence    MIT
 * @Dependency http://masonry.desandro.com
 * 
 *
 *	initialize:
 *		$('.grid').masonry().FilteredMasonry();
 *		or:
 *			$('.grid').FilterdMasonry({initMasonry: true, .. });				// masonry is also initialized and the options object is shared with masonry (if it was not initialized)
 *
 *	-> for vanilla JS, add:  $('.grid').data('masonry', msnry);  after your masonry initialization to be available for FilteredMasonry
 *
 *	auto attach to buttons/links:
 *		use the option: $('.grid').FilteredMasonry({attachClickHandler: true});
 *		or:
 *			$('.grid').getFilteredMasonry().attachClickHandler();
 *
 *		the click handler uses the .filtersItemSelector option to hold the selector ..
 *		each masonry item is tested against that selector (if one if the komma seperated 
 *		parts (= OR) validate, it is accepted: .blue,.green)
 *
 *
 *
 *  button onclick:  (show )
 *		var fm = $('.grid').getFilteredMasonry(),								// get a reference to the FilteredMasonry instance
 *			btnFilter =  $(this).data('filter');                    			// get the filter value from the button. <button data-filter="some string">Filter Number One</button>
 *	
 *		fm.filterItems( function(el, sel) { 									// the handler, gets called on each masonry item 
 *			var a = $(el).find('span.caption').data('filter');      			//  <li> ..  <span class="caption" data-filter="some string">Element for Filter Number One</span> .. </li>
 *			return a == caption;												// compare.
 *		});
 *
 *
 *	simple button click:
 *		$('.grid').getFilteredMasonry().filterItems('.blue');  					// shows all with class .blue
 *
 *
 *  multiselection checkboxes:
 *		$('type[checkbox]').on('change', function() {
 *			
 *			var activeFilters = $('type[checkbox]:checked').map(function() {	// ! outside of the handler, since the handler will be called on each masonry item
 *				return $(this).data('filter');									// .. collect current checked checkboxes, and get their data-filter=".." values
 *			});
 *
 *			var handler = function(el) { 
 *		 		var itemFilter = $(el).data('filter');							// the item to be checked
 *		 		return $.inArray(itemFilter, activeFilters) > -1;				// compare items data-filter with the used checkboxe's data-filter
 *		 	};
 *
 *		 	$('.grid').getFilteredMasonry().filterItems( handler );				// trigger the change.
 *		});
 *
 *
 *
 *	to show all, use the option to return all if none are found or,
 *	use the following for the filter:
 *		()=>true       => ES6 return true
 *		" * "          => CSS any
 *
 *
 *	Based on Kevins work: https://github.com/kevincantstop/masonry-filtering
 *   
 **/

!function($){

	$.fn.getFilteredMasonry = function() {
		return this.eq(0).data('FilteredMasonry');
	};

	$.fn.FilteredMasonry = function(options){

		var FilteredMasonry = function($container, options) {
			var ref = $container.data('FilteredMasonry');						//  gets you the instances later on (if it is allready instanciated)
			if (ref) return ref; 

			this.$container = $container;

			this.options = $.extend({}, this.options, options);

			var cache = [];
			//the main job of the function is to cache the item,because we are going to filter the items later
			$container.find(this.options.itemSelector).each(function(){
				cache.push($(this));
			});
			this.cache = cache;
			
			if (this.options.initMasonry)
				$container.masonry(this.options);

			$container.data('FilteredMasonry', this);
		};

		FilteredMasonry.prototype.options = { 									// defaults
			filtersItemSelector: '.filters > a',								// the button selector for arrachClickHandler
			itemSelector: '>*',													// the selector for the masonry items (to show and hide)
			initMasonry: false,													// if this is set to true, masonry is also initialized and the options object is shared with masonry (if it was not initialized)

			filterFunc: function(el, selector, optionalData) { 					// this is the default function to filter masonry items for selectors -> it must return True/False
				return $(el).is(selector);										// .. any non-function passed, will tested with this func.
			},
			attachClickHandler: false,
			getInstances: false,												// if false, it will return the usual jquery element as it was supplied - otherwise an array of FilteredMasonry instances -> $('.grid').FilteredMasonry({getInstances: true})
			showAllIfNone: true 												// if no items got selected, show all again
		};

		FilteredMasonry.prototype.cache = [];

		//filter items in cache
		FilteredMasonry.prototype.findItems = function(filterFuncOrSelector, optionalFilterFuncData){
			
			// it might not be a function (but a selector)
			var filterFunc = this.options.filterFunc,
				filterToUse = filterFuncOrSelector || filterFunc;
			
			//// CHROME-BUG: STACK ERROR
			//if ($.isFunction(filterToUse))
			//	filterToUse = function(i, el) { var data = optionalFilterFuncData; return filterToUse(el, data); };  // do not use call/apply to preserve any possible func-bindings
			//return $(this.cache).filter( filterToUse );

			//// alternative
			var result = [];
			$(this.cache).each(function(i, item){
				if ($.isFunction(filterToUse)) {
					if (filterToUse(item, optionalFilterFuncData)){
						result.push(item);
					}
				} 
				else {
					if(filterFunc(item, filterFuncOrSelector, optionalFilterFuncData)){
						result.push(item);
					}
				}
			});

			if (!result.length && this.options.showAllIfNone)
				result = this.cache;

			return result;
		};

		FilteredMasonry.prototype.filterItems = function(filterFunc, optionalFilterFuncData){
			var items = this.findItems(filterFunc, optionalFilterFuncData);
			this.reloadWithItems(items);
		};
		
		//reload masonry
		FilteredMasonry.prototype.reloadWithItems = function(items){
			var $container = this.$container;
			$container.empty();
			$(items).each(function(){
				$($container).append($(this));
			});
			/*
			// this block would  triggers a warning from masonry
			$container.masonry('reloadItems');
			$container.masonry('layout');
			*/
			var m = this.getMasonry();
			if (m) {
				m.reloadItems();
				m.layout();
			}
			else {
				console.error('masonry not attatched to this element:', $container);
			}
		};

		// attach filter button action
		FilteredMasonry.prototype.attachClickHandler = function(){
			var self = this;
			$(self.options.filtersItemSelector).each(function(){
				$(this).click(function(){
					var selector = $(this).attr('data-filter');				// example: data-filter=".blue,.green"
					var items = self.findItems(selector);					// finds all itmes that have a class either with blue or green
					self.reloadWithItems(items);
				})
			})
		};

		FilteredMasonry.prototype.destroy = function() {
			$container.removeData('FilteredMasonry');
			this.cache = null;
			this.options = null;
		};

		FilteredMasonry.prototype.getMasonry = function() {
			return this.$container.data('masonry');
		};

		// initialize, the jquery way
		var sum = this.map(function() {
			var $container = $(this);
			var fm = new FilteredMasonry($container, options);
			(options && options.attachClickHandler) && fm.attachClickHandler($container);
			return fm;
		 });

		if (options && options.getInstances)
			return $(sum);													// pass to jquery for array extentions
		else
			return this;

	};
}(window.jQuery)