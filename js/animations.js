var fadeIn = function(elem, onComplete) {
	elem.style.display = "block";
	window.setTimeout(function() {
		elem.style.transition = "opacity 0.3s ease-in";
	    elem.style.visibility = "visible";
	    elem.style.opacity = 1;
	    window.setTimeout(function() {
	    	if (onComplete && typeof onComplete === "function") {
	    		onComplete();
	    	}
	    }, 310);
	}, 100);
}

var fadeOut = function(elem, onComplete) {
    elem.style.transition = "opacity 0.3s ease-in";
    elem.style.opacity = 0;
    window.setTimeout(function() {
    	elem.style.display = "none";
    	if (onComplete && typeof onComplete === "function") {
    		onComplete();
    	}
    }, 310);
}

var scrolltop =function() {	
	document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    document.documentElement.pageYOffset = 0;
}

var animations = {
	fadeIn: fadeIn,
	fadeOut: fadeOut,
	scrolltop: scrolltop
};