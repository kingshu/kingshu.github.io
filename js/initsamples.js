var maxSamplesSources = 9;
var maxSamplesToShow = 6;

var randoms = [];
while (randoms.length < maxSamplesToShow) {
    var r = Math.floor(Math.random() * maxSamplesSources) + 1;
    if (randoms.indexOf(r) === -1) {
    	randoms.push(r);
    }
}
/*
  <div class="col-xs-6 col-sm-4">
    <div class="img-cont-generic suggest-img-div">
      <img id="si1" src="" width="93%">
    </div>
  </div>
*/

var numCols = 2;

var col0 = document.createElement("div");
col0.className = "col-xs-6 col-sm-4";
var col1 = document.createElement("div");
col1.className = "col-xs-6 col-sm-4";
var col2 = null;
var cols = [col0, col1];

if (window.innerWidth > 786) {
	col2 = document.createElement("div");
	col2.className = "col-sm-4";
	cols.push(col2);
	numCols = 3;	
}

for (var i = 0; i < maxSamplesToShow; i++) {
	var imgContDiv = getImageContainer("sampleimages/si_" + randoms[i] + ".jpg");
	cols[i % numCols].append(imgContDiv);
}

var inspImages = document.getElementById("insp-images");
for (var i in cols) {
	inspImages.append(cols[i]);
}

function getImageContainer(src) {
	var imgCont = document.createElement("div");
	imgCont.className = "img-cont-generic suggest-img-div";
	var img = document.createElement("img");
	img.src = src;
	img.className = "insp-img";
	img.addEventListener("click", function(e) {
		try {
			renderPreviewImage(src);	
		} catch(err) {
			alert(err);
		}
		
	});
	imgCont.append(img);
	return imgCont;
}

var renderPreviewImage = function(src) {
    var outputImg = document.getElementById('preview');
    outputImg.width = "300";
    var img = new Image();
    img.onload = function() {
        if (img.naturalWidth > 300 && window.innerWidth < 786) {
            outputImg.src = resizeImageToSpecificWidth(img, 300);
        } else if (img.naturalWidth > 600) {
            outputImg.src = resizeImageToSpecificWidth(img, 600);
            outputImg.width = "600";
        } else {
            outputImg.width = "" + img.naturalWidth;
            outputImg.src = event.target.result;
        }

        outputImg.onload = function() {
            initRow.style.display = "none";
            previewRow.style.display = "block";
            document.getElementById("retry-row").style.display = "block";
            URL.revokeObjectURL(outputImg.src) // free memory
        };
    };
    img.src = src;
};


function resizeImageToSpecificWidth(img, width) {
    var oc = document.createElement('canvas'), octx = oc.getContext('2d');
    oc.width = img.width;
    oc.height = img.height;
    octx.drawImage(img, 0, 0);
    while (oc.width * 0.5 > width) {
        oc.width *= 0.5;
        oc.height *= 0.5;
        octx.drawImage(oc, 0, 0, oc.width, oc.height);
    }
    oc.width = width;
    oc.height = oc.width * img.height / img.width;
    octx.drawImage(img, 0, 0, oc.width, oc.height);
    return oc.toDataURL();
}

