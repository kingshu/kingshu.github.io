var randoms = [];
var samplesIndex = 0;
var adsIndex = 19294;
var numSamplesToShow = 6;
var maxSamplesSources = 29;
var imgUrlFormat = "https://res.cloudinary.com/dfwzn7aaw/image/upload/v1592678508/sampleimages/si_";

var ordered = [];
for (i = 1 ; i <= maxSamplesSources; i++) {
    ordered.push(i)
}
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}
randoms = shuffle(ordered);

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

var createSamples = function() {
    for (var i = 0; i < numSamplesToShow; i++) {
        var imgContDiv;
        //if (samplesIndex % 5 == 3) {
        if (samplesIndex % 10 == 6 || samplesIndex % 10 == 9) {
            imgContDiv = sampler.getAdContainer2();
        } else {
            imgContDiv = sampler.getImageContainer(imgUrlFormat + randoms[samplesIndex] + ".jpg");
        }
        cols[samplesIndex % numCols].append(imgContDiv);
        samplesIndex++;
        if (samplesIndex >= randoms.length) {
            document.getElementById("showmore").innerHTML = "&#128542 We're sorry, these are all the images we have for now! We curate these frequently, so check back in soon for new ones!";
            break;
        }
    }

    var inspImages = document.getElementById("insp-images");
    for (var i=0; i<cols.length; i++) {
        inspImages.append(cols[i]);
    }
}

var getAdContainer2 = function(src) {
    var adCont = document.createElement("div");
    adCont.className = "img-cont-generic suggest-img-div ad-cont";
    var adTitle = document.createElement("span");
    adTitle.className = "ad-title";
    adTitle.innerHTML = "Advertisement";
    adCont.append(adTitle);
    
    var ad_id = "block_" + adsIndex;
    var ad = document.createElement("div");
    ad.id = ad_id;
    sampler.adUnits.push({
        code: ad_id,
        placement_id: adsIndex,
        sizes: [300, 250]
    });
    smarty.buildUnits(sampler.adUnits);

    adCont.append(ad);
    adsIndex++;
    return adCont;
}

var getAdContainer = function(src) {
    var adCont = document.createElement("div");
    adCont.className = "img-cont-generic suggest-img-div ad-cont";
    var adTitle = document.createElement("span");
    adTitle.className = "ad-title";
    adTitle.innerHTML = "Advertisement";
    adCont.append(adTitle);
    var ad = document.createElement("script");
    ad.setAttribute("data-cfasync", "false");
    ad.setAttribute("type", "text/javascript");
    ad.src = "//p403126.clksite.com/adServe/banners?tid=403126_791173_" + adsIndex;
    adCont.append(ad);
    adsIndex++;
    return adCont;
}

var getImageContainer = function(src) {
	var imgCont = document.createElement("div");
	imgCont.className = "img-cont-generic suggest-img-div";
	var img = document.createElement("img");
	img.src = src;
    img.crossOrigin = "Anonymous";
	img.className = "insp-img";
	img.addEventListener("click", function(e) {
        renderPreviewImage(src);
	});
	imgCont.append(img);
	return imgCont;
}

var renderPreviewImage = function(src) {
    var outputImg = document.getElementById('preview');
    outputImg.width = "300";
    var img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = function() {
        if (img.naturalWidth > 300 && window.innerWidth < 786) {
            outputImg.src = resizeImageToSpecificWidth(img, 300);
        } else if (img.naturalWidth > 600) {
            outputImg.src = resizeImageToSpecificWidth(img, 600);
            outputImg.width = "600";
            } else {
            outputImg.width = "" + img.naturalWidth;
            outputImg.src = src;
        }

        outputImg.onload = function() {
            animations.fadeOut(initRow, function() {
                animations.scrolltop();
                animations.fadeIn(document.getElementById("preview-row"));
            });
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


var sampler = {
    createSamples: createSamples,
    getImageContainer: getImageContainer,
    getAdContainer: getAdContainer,
    getAdContainer2: getAdContainer2,
    renderPreviewImage: renderPreviewImage,
    resizeImageToSpecificWidth: resizeImageToSpecificWidth,
    adUnits: []
};

sampler.createSamples();

document.getElementById("nolike-btn").addEventListener("click", function(e) {
    sampler.createSamples();
});
