var tabHeaderPalette = document.getElementById("palette-tab");
var tabHeaderList = document.getElementById("list-tab");

var tabContentPalette = document.getElementById("palette-content");
var tabContentList = document.getElementById("list-content");

tabHeaderPalette.addEventListener("click", function(e) {
	tabHeaderList.className = tabHeaderList.className.replace(/\s*active\s*/g, "");
	tabHeaderPalette.className += " active";
	tabContentList.style.display = "none";
	tabContentPalette.style.display = "block";
});

tabHeaderList.addEventListener("click", function(e) {
	tabHeaderPalette.className = tabHeaderPalette.className.replace(/\s*active\s*/g, "");
	tabHeaderList.className += " active";
	tabContentPalette.style.display = "none";
	tabContentList.style.display = "block";
});