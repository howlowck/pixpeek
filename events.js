/**
 * Created by haoluo on 1/11/14.
 */
var title = 'PixPeeker';
var currentState;
getEnabled(function (enabled) {
    if (enabled) {
        chrome.browserAction.setIcon({path: 'media/on.png'});
        currentState = true;
    } else {
        chrome.browserAction.setIcon({path: 'media/off.png'});
        currentState = false;
    }
});

chrome.browserAction.onClicked.addListener(function (tab) {
    getEnabled(function (enabled) {
        if (enabled) {
            chrome.browserAction.setIcon({path: 'media/off.png'});
            setTitle(false);
            currentState = false;
        } else {
            chrome.browserAction.setIcon({path: 'media/on.png'});
            setTitle(true);
            currentState = true;
        }
    });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    var response = {};
    response.enabled = currentState;
    sendResponse(response);
});

function getEnabled(callback) {
    chrome.browserAction.getTitle({}, function (title) {
        callback( title.match(/Enabled/i) !== null );
    });
}

function setTitle(enabled) {
    if (enabled) {
        chrome.browserAction.setTitle({'title': title + '-Enabled'});
    } else {
        chrome.browserAction.setTitle({'title': title + '-Disabled'});
    }
}

