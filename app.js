/**
 * Created by haoluo on 1/11/14.
 */
var frameId = "pixpeek-extension-frame";
var imgPatt = /^.*(jpg|png|gif){1}(\?.*)?$/i;
var state = false;
var hiddenEl = document.createElement('div');
var queries = {
    'imgur': '#content #image img',
    'imgur-album': '#content #image-container .image img',
    'livememe': '#memeImage'
}
var images = [];
var currentType;
anchors = [].slice.call(document.querySelectorAll('a'));
anchors.forEach(function(a) {
    a.addEventListener('mouseover', processAnchorLink);
    a.addEventListener('mouseout', reset);
});

function guessSourceType(url) {
    if (str_in(/\/\/.*imgur.com\/a\/.+\#\d+/, url)) {
        currentType = 'multi-page';
        return 'imgur-album-multi'
    }

    if (str_in(/imgur.+\/a\/.+/, url)) {
        currentType = 'album';
        return 'imgur-album';
    }

    if ( str_in(/imgur/, url) ) {
        currentType = 'single';
        return 'imgur';
    }
    if ( str_in(/livememe/, url) ) {
        currentType = 'single';
        return 'livememe';
    }
}

function processAnchorLink(ev) {
    isEnabled(function () {
//        console.log(ev);
        if (ev.target.tagName == 'IMG') {
             main(ev.target.parentElement);
        } else {
            main(ev.target);
        }
    });
}

function main(el) {
    console.log(el);
    if (str_in(imgPatt, el.href)) {
        makeEmbed([el.href]);
    } else {
        fetchContent(el);
    }
}
function makeEmbed(srcArray) {
    frame = getFrame();
    setStyle(frame, {
        position: 'fixed',
        top: 0,
        right: 0,
        'z-index': '9999999'
    });
    srcArray.forEach(function (src) {
        makeImage(src);
    });
}

function fetchContent(anchor) {
    var xhr = new XMLHttpRequest();
    var url = anchor.href;
    var type = guessSourceType(url);
    if (queries.hasOwnProperty(type)) {
        xhr.open("GET", url);
        xhr.onload = function() {
            // innerText does not let the attacker inject HTML elements.
            hiddenEl.innerHTML = xhr.response;
            var nodes = hiddenEl.querySelectorAll(queries[type]);
            if (nodes.length > 0) {
                var imgArray = [].slice.call(nodes);
                makeEmbed(getSrc(imgArray));
            }
        }
        xhr.send();
    }
}

function getFrame() {
    var frame = document.getElementById(frameId);
    if (frame == null) {
        frame = document.createElement('div');
        frame.id = frameId;
        document.body.appendChild(frame);
    }
    return frame;
}

function setStyle(el ,styles) {
    var styleString = '';
   for (var prop in styles)  {
       styleString += prop + ': ' + styles[prop]+'; ';
   }
    el.setAttribute('style', styleString);
}

function str_in(pat, str) {
    if (typeof str == 'undefined' || str == null) {
        return false;
    }
    results = str.match(pat);
    return !! results;
}

function removeEmbed() {
    var frame = getFrame();
    document.body.removeChild(frame);
}

function isEnabled(callback) {
    var result;
    chrome.runtime.sendMessage('currentState', function(response) {
         if ( response.enabled == true ) {
             callback();
         }
    });
}
function makeImage(src) {
    var frame = getFrame();
    var img = document.createElement('img');
    images.push(img);
    img.src = src;

    if (images.length > 1) {
       hide(img);
    } else {
       showImg(img);
    }
    frame.appendChild(img);
    console.log(currentType);
}

function getSrc(elArray) {
    var patt = /\/\//;
    var srcArray = [];
    elArray.forEach(function (el) {
        console.log(el);
        if (str_in(patt, el.src)) {
            srcArray.push(el.src);
        }
        if (str_in(patt, el.getAttribute('data-src'))) {
            srcArray.push(el.getAttribute('data-src'));
        }
    });
    return srcArray;
}

function hide(el) {
    setStyle(el, {
        display: 'none'
    });
}

function showImg(el) {
    setStyle(el, {
        display: 'block',
        'max-width': '500px',
        width: '100%'
    });
}

function reset() {
    removeEmbed();
    images = [];
    currentType = 'undetermined';
}