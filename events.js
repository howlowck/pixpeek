/**
 * Created by haoluo on 1/11/14.
 */
stamp = document.createElement('div');
stamp.id = 'extension-on';
document.body.appendChild(stamp);
chrome.browserAction.onClicked.addListener(function (tab) {
    if (stamp.id == 'extension-on') {
        chrome.browserAction.setIcon({path: 'media/off.png'});
        stamp.id = 'extension-off';
    } else {
        chrome.browserAction.setIcon({path: 'media/on.png'});
        stamp.id = 'extension-on';
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    var response = {};
    if (stamp.id == 'extension-on') {
        response.enabled = true;
    } else {
        response.enabled = false;
    }
    sendResponse(response);
})