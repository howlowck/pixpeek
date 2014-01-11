/**
 * Created by haoluo on 1/11/14.
 */
var frameId = "pixpeek-extension-frame";
var imgPatt = /^.*(jpg|png|gif){1}(\?.*)?$/i;
var state = false;
var hiddenEl = document.createElement('div');
var queries = {
    'imgur': '#content img',
    'livememe': '#memeImage'
}
anchors = Array.prototype.slice.call(document.querySelectorAll('a'))
anchors.forEach(function(a) {
    a.addEventListener('mouseover', processAnchorLink);
    a.addEventListener('mouseout', removeEmbed);
});

function processAnchorLink(ev) {
    isEnabled(function () {
        if (str_in(imgPatt, ev.target.href)) {
            makeEmbed(ev.target.href);
        } else {
            fetchContent(ev.target.href);
        }
    });
}

function makeEmbed(anchor) {

    frame = getFrame();
    frame.src = anchor;
    setFrameStyle({
        'max-width': '500px',
        width: '100%',
        position: 'fixed',
        top: 0,
        right: 0,
        'z-index': '9999999'
    });
}

function fetchContent(url) {
    var xhr = new XMLHttpRequest();
    var type = guessSourceType(url);
    if (type in queries) {
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                // innerText does not let the attacker inject HTML elements.
                hiddenEl.innerHTML = xhr.response;
                var img = hiddenEl.querySelector(queries[type]);
                if (!! img) {
                    makeEmbed(img.src);
                }
            }
        }
    }
    xhr.send();
}

function getFrame() {
    var frame = document.getElementById(frameId);
    if (frame == null) {
        frame = document.createElement('img');
        frame.id = frameId;
        document.body.appendChild(frame);
    }
    return frame;
}
function setFrameDim(width, height) {
   setFrameStyle({
       'width' : width + 'px',
       'height': height + 'px'
   });
}

function setFrameStyle(styles) {
    var styleString = '';
   for (var prop in styles)  {
       styleString += prop + ': ' + styles[prop]+'; ';
   }
    var frame = getFrame();
    frame.setAttribute('style', styleString);
}

function str_in(pat, str) {
    if (typeof str == 'undefined') {
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

function guessSourceType(url) {
    if ( str_in(/imgur/, url) ) {
        return 'imgur';
    }
    if ( str_in(/livememe/, url) ) {
        return 'livememe';
    }

}