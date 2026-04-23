import { decodeHex, decodeLink } from "./econ/decode.js";
import { generateHex } from "./econ/encode.js";


chrome.runtime.onInstalled.addListener(() => {
    chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [1, 2]
    });
});

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    sendTabMessage({ action: 'web_url_changed', url: details.url });
});

chrome.webNavigation.onCompleted.addListener(
    (details) => {
        const url = new URL(details.url);

        if (url.host === 'csfloat.com') {
            if (url.pathname === '/search' || url.pathname === '/profile/watchlist') {
                sendTabMessage({ action: 'csfloat_market_loaded', url: details.url });
            } else if (url.pathname === '/db') {
                sendTabMessage({ action: 'csfloat_db_loaded', url: details.url });
            }
        } else if (url.host === 'bitskins.com') {
            sendTabMessage({ action: 'bitskins_loaded', url: details.url });
        } else if (url.host === 'buff.163.com' && url.pathname.includes('goods')) {
            sendTabMessage({ action: 'buff163_loaded', url: details.url });
        }
    },
    { url: [{ schemes: ['http', 'https'] }] }
);

function sendTabMessage(data) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, data);
        }
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "fetch_skin") {
        try {
           
            const econ = decodeLink(message.url);
            const hex = generateHex(econ);
            console.log(`Generated hex: ${hex}`);
            sendResponse({ code: `!g ${hex}` });
        } catch (err) {
        
            sendResponse({ error: err.toString() });
        }
    }
});