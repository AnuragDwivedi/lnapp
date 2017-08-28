// For user location
var geocoder = new google.maps.Geocoder();
// For Scroll animation
$(function() {
  $('a[href*=\\#]:not([href=\\#])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html,body').animate({
          scrollTop: target.offset().top - 30
        }, 1000);
        
        // Hide the toggle menus after scroll
        if (target.selector !== "#header")
        	$('.navbar-toggle').click();
        
        return false;
      }
    }
  });
});

// For activating default menu in navbar
$(document).ready(function () {
	var navbarToggle = $('.navbar-toggle')[0];
	//$('#superEconomyModal').modal('show');
	function scroll() {	
		/* Activate Home tab when scrolls to top */
		var scrollTop = $(window).scrollTop();
		if( scrollTop == 0 ) {
			//$("#navbar a").blur();
			$("#fixed-header").slideUp();
			var element = angular.element($('html'));
		    var controller = element.controller();
		    var scope = element.scope();
		    
		    scope.$apply(function() {
		      scope.changeActiveTab('Home');
		    });
		} else {
			$("#fixed-header").slideDown('slow');
		}
		
		if (scrollTop > 190) {
			// Hide the toggle menus after scroll of menu height only if it is expanded
			if (navbarToggle.getAttribute("class").indexOf("collapsed") === -1) {
				$('.navbar-toggle').click();
			}
		}
	}
    
//    $('#map').addClass('scrolloff');                // set the mouse events to none when doc is ready
//        
//    $('#overlay').on("mouseup touchstart",function(){          // lock it when mouse up
//        $('#map').addClass('scrolloff'); 
//        //somehow the mouseup event doesn't get call...
//    });
//    $('#overlay').on("mousedown touchend",function(){        // when mouse down, set the mouse events free
//        $('#map').removeClass('scrolloff');
//    });
//    $("#map").mouseleave(function () {              // becuase the mouse up doesn't work... 
//        $('#map').addClass('scrolloff');            // set the pointer events to none when mouse leaves the map area
//                                                    // or you can do it on some other event
//    });
	
	//window.addEventListener("load", setTimeout( function(){ window.scrollTo(0, 1) }, 0));
	document.onscroll = scroll;
});
		