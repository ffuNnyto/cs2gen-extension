chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "web_url_changed", url: details.url });
    });

});

chrome.webNavigation.onCompleted.addListener(function (details) {


    let url = new URL(details.url)

    

    if (url.pathname==='/search' && url.host==='csfloat.com') {

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "csfloat_market_loaded", url: details.url });
        });
    }

    else if (url.pathname==='/db' && url.host==='csfloat.com') {

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "csfloat_db_loaded", url: details.url });
        });
    }
    else if (url.pathname.includes('goods') && url.host==='buff.163.com') {
        
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "buff163_loaded", url: details.url });
        });
    }



}, { url: [{ schemes: ['http', 'https'] }] }); 
