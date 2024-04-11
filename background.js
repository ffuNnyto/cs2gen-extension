chrome.webNavigation.onHistoryStateUpdated.addListener((details) =>
    sendTabMessage({ action: 'web_url_changed', url: details.url })
);

chrome.webNavigation.onCompleted.addListener(function (details) {


    let url = new URL(details.url)

    if (url.pathname === '/search' && url.host === 'csfloat.com') {

        sendTabMessage({ action: 'csfloat_market_loaded', url: details.url })
    }

    else if (url.pathname === '/db' && url.host === 'csfloat.com') {

        sendTabMessage({ action: 'csfloat_db_loaded', url: details.url })
    }
    else if (url.host === 'bitskins.com') {

        sendTabMessage({ action: 'bitskins_loaded', url: details.url })
    }
    else if (url.pathname.includes('goods') && url.host === 'buff.163.com') {

        sendTabMessage({ action: 'buff163_loaded', url: details.url })
    }



}, { url: [{ schemes: ['http', 'https'] }] });


function sendTabMessage(data) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, data);
    });
}