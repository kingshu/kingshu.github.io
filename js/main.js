function processImage() {
    var numColors = document.getElementById('num-colors').value;

    // options with defaults (not required)
    var opts = {
        colors: numColors,       // desired palette size
        method: 2,               // histogram method, 2: min-population threshold within subregions; 1: global top-population
        boxSize: [64,64],        // subregion dims (if method = 2)
        boxPxls: 2,              // min-population threshold (if method = 2)
        initColors: 4096,        // # of top-occurring colors  to start with (if method = 1)
        minHueCols: 0,           // # of colors per hue group to evaluate regardless of counts, to retain low-count hues
        dithKern: null,          // dithering kernel name, see available kernels in docs below
        dithDelta: 0,            // dithering threshhold (0-1) e.g: 0.05 will not dither colors with <= 5% difference
        dithSerp: false,         // enable serpentine pattern dithering
        palette: [],             // a predefined palette to start with in r,g,b tuple format: [[r,g,b],[r,g,b]...]
        reIndex: false,          // affects predefined palettes only. if true, allows compacting of sparsed palette once target palette size is reached. also enables palette sorting.
        useCache: true,          // enables caching for perf usually, but can reduce perf in some cases, like pre-def palettes
        cacheFreq: 10,           // min color occurance count needed to qualify for caching
        colorDist: "euclidean",  // method used to determine color distance, can also be "manhattan"
    };

    var q = new RgbQuant(opts);

    var img = document.querySelector('#preview');

    // analyze histograms
    q.sample(img);

    // build palette
    var pal = q.palette();
    var pcan = drawPixels(pal, 5, 300);
    var palt = document.querySelector('#palt');
    palt.append(pcan);

    // reduce images
    var out = q.reduce(img)
    var imgWidth = 600;
    if (window.innerWidth < 600) {
        imgWidth = 300;
    }
    var ican = drawPixels(out, img.naturalWidth, imgWidth);

    var redu = document.querySelector('#redu');
    redu.append(ican);
};

function getColor(canvas, x, y) {    
    var context = canvas.getContext("2d");
    var pixel = context.getImageData(x, y, 1, 1);

    // Red = rgb[0], green = rgb[1], blue = rgb[2]
    // All colors are within range [0, 255]
    var rgb = pixel.data;

    return rgb;
}

function drawPixels(idxi8, width0, width1) {
    var idxi32 = new Uint32Array(idxi8.buffer);

    width1 = width1 || width0;

    var can = document.createElement("canvas"),
        can2 = document.createElement("canvas"),
        ctx = can.getContext("2d"),
        ctx2 = can2.getContext("2d");

    can.width = width0;
    can.height = Math.ceil(idxi32.length / width0);
    can2.width = width1;
    can2.height = Math.ceil(can.height * width1 / width0);

    ctx.imageSmoothingEnabled = ctx.mozImageSmoothingEnabled = ctx.webkitImageSmoothingEnabled = ctx.msImageSmoothingEnabled = false;
    ctx2.imageSmoothingEnabled = ctx2.mozImageSmoothingEnabled = ctx2.webkitImageSmoothingEnabled = ctx2.msImageSmoothingEnabled = false;

    var imgd = ctx.createImageData(can.width, can.height);

    if (typeOf(imgd.data) == "CanvasPixelArray") {
        var data = imgd.data;
        for (var i = 0, len = data.length; i < len; ++i)
            data[i] = idxi8[i];
    }
    else {
        var buf32 = new Uint32Array(imgd.data.buffer);
        buf32.set(idxi32);
    }

    ctx.putImageData(imgd, 0, 0);

    ctx2.drawImage(can, 0, 0, can2.width, can2.height);

    can2.addEventListener('click', function(event) {
        event.stopPropagation();
        showColor(can2, event);
    });

    return can2;
}

var tooltip = document.getElementById('tooltip');
function showColor(canvas, e) {
    var rgb = getColor(canvas, e.layerX, e.layerY);

    var renderAbove = false;
    var renderLeft = false;

    tooltip.style.visibility = "visible";
    if ((e.clientY - 350) < 20) {
        tooltip.style.top = e.clientY + "px";
    } else {
        tooltip.style.top = (e.clientY - 340) + "px";
        renderAbove = true;
    }

    if ((e.clientX - 240) < 0) {
        tooltip.style.left = e.clientX + "px";
    } else {
        tooltip.style.left = (e.clientX - 240) + "px";
        renderLeft = true;
    }

    if (renderAbove) {
        if (renderLeft) {
            tooltip.className = 'upleft';
        } else {
            tooltip.className = 'upright';
        }
    } else {
        if (renderLeft) {
            tooltip.className = 'downleft';
        } else {
            tooltip.className = 'downright';
        }
    }

    var closestFlosses = window.findClosest10(rgb[0], rgb[1], rgb[2]);

    var closestColors = document.getElementById("closestcolors");
    closestcolors.innerHTML = "";
    for (var i in closestFlosses) {
        var colorCont = document.createElement("div");
        colorCont.className = "color-container";

        var colorball = document.createElement("div");
        colorball.className = "colorball";
        colorball.style.backgroundColor = "rgb(" 
                                            + closestFlosses[i]['r'] + ","
                                            + closestFlosses[i]['g'] + ","
                                            + closestFlosses[i]['b'] + ")";
        var flossNum = document.createElement("div");
        flossNum.className = "flossnum";
        flossNum.innerHTML = closestFlosses[i]['floss'];

        var flossName = document.createElement("div");
        flossName.className = "flossname";
        flossName.innerHTML = closestFlosses[i]['name'];

        colorCont.append(colorball);
        colorCont.append(flossNum);
        colorCont.append(flossName);

        closestColors.append(colorCont);
    }
}

function typeOf(val) {
    return Object.prototype.toString.call(val).slice(8,-1);
}

var goBtn = document.getElementById('go');
var pRow = document.getElementById('preview-row');
var rRow = document.getElementById('results-row');
var ldr = document.getElementById('loader');
goBtn.addEventListener('click', function(event) {
    event.preventDefault();
    ldr.style.top = ((window.innerHeight / 2) - 150) + "px";
    ldr.style.left = ((window.innerWidth / 2) - 150) + "px";
    ldr.style.visibility = "visible";
    processImage();
    window.setTimeout(function() {
        ldr.style.visibility = "hidden";
        rRow.style.display = "block";
        pRow.style.display = "none";
    }, 5000);
});

window.addEventListener('click', function(event) {
    tooltip.style.visibility = "hidden";
});

var desc = document.getElementById("description");
var descBtn = document.getElementById("description-btn");
descBtn.addEventListener('click', function(event) {
    desc.innerHTML = "This is going to reduce the number of colors in the image to the number you set. So, if you are doing a high-detail technique like thread painting, you probably want to set this number higher, like 50. This will simplify your image to 50 different colors each corresponding to a different color of floss. In contrast, a cross-stitch project might only use 10 different floss colors, so for something like that, you should set this number to 10.";
    event.preventDefault();
});
