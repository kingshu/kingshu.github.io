var PAGE_HEIGHT = 900;

document.getElementById("print-btn").addEventListener("click", function() {
    var imgDataUrl = document.getElementById('canvas-reducedimg').toDataURL();
    var pltDataUrl = document.getElementById('canvas-palette').toDataURL();
    var colorList = document.getElementById('color-list');

    var titleContStr = '<div class="title-cont print-elem"><img id="title-img" src="css/img/flossfinder.png"><img id="title-img" src="css/img/flossfinder.png"><img id="title-img" src="css/img/flossfinder.png"><img id="title-img" src="css/img/flossfinder.png"><img id="title-img" src="css/img/flossfinder.png"><img id="title-img" src="css/img/flossfinder.png"></div>'

    var a = window.open('', '', 'height=700, width=700'); 
    a.document.write('<html><body>');
    a.document.write(titleContStr);
    a.document.write('<link rel="stylesheet" href="css/print.css" type="text/css"/>');
    a.document.write('<link rel="stylesheet" href="css/bootstrap.min.css" type="text/css"/>');
    a.document.write('<h3 class="print-elem">Reduced color image</h3>')
    a.document.write('<div id="redu-img-cont" class="print-elem bottom-spaced"><img id="redu-img" src="' + imgDataUrl + '"></div>');
    a.document.write(titleContStr);
    a.document.write('<div class="print-elem bottom-spaced"><h3>Palette:</h3><img class="palt-img" src="' + pltDataUrl + '"></div>');
    a.document.write('<div class="print-elem bottom-spaced color-list"><h3>Threads list</h3>' + colorList.innerHTML + '</div>');
    a.document.write('</body></html>'); 
    a.document.close();
    a.focus();

    var btnContainer = a.document.createElement("div");
    btnContainer.className = "button-container";

    var lgBtn = a.document.createElement('button');
    lgBtn.className = "print-btn btn btn-lg btn-default";
    lgBtn.id = "print-lg";
    lgBtn.innerHTML = "Print large size";
    lgBtn.addEventListener("click", function(){
        transformImg(a, PAGE_HEIGHT);
        btnContainer.style.display = "none";
        showPrintElems(a);
        triggerPrintDialog(a);
    });
    btnContainer.append(lgBtn);
    btnContainer.append(a.document.createElement("br"));

    var mdBtn = a.document.createElement('button');
    mdBtn.className = "print-btn btn btn-md btn-default";
    mdBtn.id = "print-md";
    mdBtn.innerHTML = "Print medium size";
    mdBtn.addEventListener("click", function(){
        transformImg(a, Math.floor(PAGE_HEIGHT/2));
        btnContainer.style.display = "none";
        showPrintElems(a);
        triggerPrintDialog(a);
    });
    btnContainer.append(mdBtn);
    btnContainer.append(a.document.createElement("br"));

    var smBtn = a.document.createElement('button');
    smBtn.className = "print-btn btn btn-sm btn-default";
    smBtn.id = "print-sm";
    smBtn.innerHTML = "Print small size";
    smBtn.addEventListener("click", function(){
        transformImg(a, Math.floor(PAGE_HEIGHT/3));
        btnContainer.style.display = "none";
        showPrintElems(a);
        triggerPrintDialog(a);
    });
    btnContainer.append(smBtn);

    a.document.body.append(btnContainer);
});

function transformImg(a, displayImgHeight) {
    var reduImg = a.document.getElementById("redu-img");
    if (reduImg.naturalWidth > reduImg.naturalHeight) {
        reduImg.style.width = displayImgHeight + "px";
        reduImg.style.transform = "rotate(-90deg)";
    } else {
        reduImg.style.height = displayImgHeight + "px";
    }

    var reduImgCont = a.document.getElementById("redu-img-cont");
    reduImgCont.style.paddingTop = Math.floor((PAGE_HEIGHT/2) - (reduImg.height/2)) + "px";
    console.log(reduImgCont.style.paddingTop);
}

function showPrintElems(a) {
    var pElems = a.document.getElementsByClassName('print-elem');
    for (var i=0; i<pElems.length; i++) {
        pElems[i].style.visibility = "visible";
    }
}

function triggerPrintDialog(a) {
    setTimeout(function() {
        a.print();
        setTimeout(a.close, 200);
    }, 100);
}