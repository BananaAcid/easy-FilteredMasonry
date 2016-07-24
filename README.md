# easy-FilteredMasonry : Control object to handle filters on masonry.js grids
just do your usual masonry business, then call FilteredMasonry on the same element.


@Author     Nabil Redmann (BananaAcid) <repo@bananaacid.de>
@Licence    MIT
@Dependency http://masonry.desandro.com
 

	initialize:
		$('.grid').masonry().FilteredMasonry();
		or:
			$('.grid').FilterdMasonry({initMasonry: true, .. });				// masonry is also initialized and the options object is shared with masonry (if it was not initialized)

	-> for vanilla JS, add:  $('.grid').data('masonry', msnry);  after your masonry initialization to be available for FilteredMasonry

	auto attach to buttons/links:
		use the option: $('.grid').FilteredMasonry({attachClickHandler: true});
		or:
			$('.grid').getFilteredMasonry().attachClickHandler();

		the click handler uses the .filtersItemSelector option to hold the selector ..
		each masonry item is tested against that selector (if one if the komma seperated 
		parts (= OR) validate, it is accepted: .blue,.green)



  button onclick:  (show )
		var fm = $('.grid').getFilteredMasonry(),								// get a reference to the FilteredMasonry instance
			btnFilter =  $(this).data('filter');                    			// get the filter value from the button. <button data-filter="some string">Filter Number One</button>
	
		fm.filterItems( function(el, sel) { 									// the handler, gets called on each masonry item 
			var a = $(el).find('span.caption').data('filter');      			//  <li> ..  <span class="caption" data-filter="some string">Element for Filter Number One</span> .. </li>
			return a == caption;												// compare.
		});


	simple button click:
		$('.grid').getFilteredMasonry().filterItems('.blue');  					// shows all with class .blue


  multiselection checkboxes:
		$('type[checkbox]').on('change', function() {
			
			var activeFilters = $('type[checkbox]:checked').map(function() {	// ! outside of the handler, since the handler will be called on each masonry item
				return $(this).data('filter');									// .. collect current checked checkboxes, and get their data-filter=".." values
			});

			var handler = function(el) { 
		 		var itemFilter = $(el).data('filter');							// the item to be checked
		 		return $.inArray(itemFilter, activeFilters) > -1;				// compare items data-filter with the used checkboxe's data-filter
		 	};

		 	$('.grid').getFilteredMasonry().filterItems( handler );				// trigger the change.
		});



	to show all, use the option to return all if none are found or,
	use the following for the filter:
		()=>true       => ES6 return true
		" * "          => CSS any


	Based on Kevins work: https://github.com/kevincantstop/masonry-filtering
