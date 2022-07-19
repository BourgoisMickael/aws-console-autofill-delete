console.debug('running background.js')

function onCompletedListener(details) {
    if (details.type === 'image' || details.type === 'ping' || !details.url.includes('console.aws.amazon.com')) return
    console.debug('REQ', details.type, details.url,  details)

    chrome.tabs.query({active: true, currentWindow: true}, function tabCb(tabs){
        if (tabs?.[0]?.id ?? false) {
            chrome.tabs.sendMessage(tabs[0].id, 'REQUEST');
        } else {
            console.warn(tabs)
        }
    });
}

const debouncedOnCompleted = debounce(onCompletedListener, 250)


chrome.webRequest.onCompleted.addListener(debouncedOnCompleted, { urls: ["https://*.amazon.com/*"] });

/**
 * Originally inspired by  David Walsh (https://davidwalsh.name/javascript-debounce-function)
 * Returns a function, that, as long as it continues to be invoked, will not be triggered.
 * The function will be called after it stops being called for `wait` milliseconds.
 */
function debounce (func, wait) {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};
