import { decodeHex, decodeLink } from "./econ/decode.js";
import { generateHex } from "./econ/encode.js";
import { findFade } from "./econ/fade.js";

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
    if (message.action === "fade_lookup") {
        sendResponse({ fade: findFade(message.title, message.seed) ?? null });
        return;
    }

    if (message.action === "fetch_skin") {
        try {
            sendResponse({ code: buildGenCode(message.url) });
        } catch (err) {
            sendResponse({ error: err.toString() });
        }
    }
});

function buildGenCode(inspectLink) {
    const econ = decodeLink(inspectLink);
    const { inventory, origin, itemid, ...rest } = econ
    const hex = generateHex(rest);

    console.log(`Generated hex: ${hex}`);

    return `!g ${hex}`;
}

const CONTEXT_MENU_ID = 'cs2gen-copy-gen';

function syncContextMenu() {
    chrome.storage.sync.get('settings', ({ settings }) => {
        chrome.contextMenus.removeAll(() => {
            if (settings?.features?.contextMenu === false) return;

            chrome.contextMenus.create({
                id: CONTEXT_MENU_ID,
                title: 'Copy !gen',
                contexts: ['link'],
            });
        });
    });
}

chrome.runtime.onInstalled.addListener(syncContextMenu);
chrome.runtime.onStartup.addListener(syncContextMenu);
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.settings) syncContextMenu();
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== CONTEXT_MENU_ID || !tab?.id) return;

    const link = info.linkUrl ?? '';
    const isInspectLink = link.startsWith('steam://') && link.includes('csgo_econ_action_preview');

    try {
        const code = isInspectLink ? buildGenCode(link) : null;
        await showInTab(tab.id, code);
    } catch (err) {
        console.error('Context menu error:', err);
        await showInTab(tab.id, null).catch(() => { });
    }
});

async function showInTab(tabId, code) {
    const target = { tabId };

    const [{ result: loaded }] = await chrome.scripting.executeScript({
        target,
        func: () => typeof throwToast === 'function' && typeof copyToClipBoard === 'function' && typeof cs2genSettings !== 'undefined',
    });

    if (!loaded) {
        await chrome.scripting.executeScript({
            target,
            files: ['src/util/settings.js', 'src/util/toast.js', 'src/util/utils.js'],
        });
    }

    await chrome.scripting.executeScript({
        target,
        func: (text) => {
            if (text) copyToClipBoard(text);
            else throwToast("That isn't a valid CS2 inspect link.", 'error');
        },
        args: [code],
    });
}