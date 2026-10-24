const CS2GEN_HISTORY_LIMIT = 10;

async function copyToClipBoard(txt) {
    const text = String(txt);

    try {
        await navigator.clipboard.writeText(text);
    } catch (_) {
        if (!legacyCopy(text)) return throwToast('Could not access the clipboard.', 'error');
    }

    throwToast('Paste it in the CS2 console to use it.', 'success', text);
    recordCopyHistory(text);
}

function legacyCopy(text) {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.cssText = 'position:fixed;top:-1000px;opacity:0';
    document.body.appendChild(area);
    area.select();

    let copied = false;
    try { copied = document.execCommand('copy'); } catch (_) { }
    area.remove();
    return copied;
}

function recordCopyHistory(code) {
    try {
        const site = (typeof CS2GEN_HOSTS !== 'undefined' && CS2GEN_HOSTS[location.hostname.replace(/^www\./, '')]) || 'link';
        chrome.storage.local.get('history', ({ history = [] }) => {
            const entry = { code, site, time: Date.now() };
            const next = [entry, ...history.filter((item) => item.code !== code)].slice(0, CS2GEN_HISTORY_LIMIT);
            chrome.storage.local.set({ history: next });
        });
    } catch (_) { }
}
