const BUFFMARKET_ROW_SELECTOR = '.market-goods-sell-content';
const buffmarketAssets = new Map();
const buffmarketCodes = new Map();


window.addEventListener('message', ({ source, data }) => {
    if (source !== window || data?.source !== 'cs2gen' || data.type !== 'buff-assets') return;
    data.items.forEach(([float, assetId]) => buffmarketAssets.set(float, assetId));
});

function buffmarketReady() {
    createToastContainer();
    addBuffmarketButtons(document);

    let timer = null;
    new MutationObserver(() => {
        if (timer) return;
        timer = setTimeout(() => {
            timer = null;
            addBuffmarketButtons(document);
        }, 100);
    }).observe(document.body, { childList: true, subtree: true });
}

function addBuffmarketButtons(root) {
    root.querySelectorAll(BUFFMARKET_ROW_SELECTOR).forEach((row) => {
        const view = row.querySelector('.view');
        if (!view || view.querySelector('.gen-btn')) return;

        const template = view.querySelector('span');
        if (!template) return;

       
        const btn = template.cloneNode(false);
        btn.classList.add('gen-btn');
        btn.textContent = '!gen';
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
           
            handleBuffmarketClick(btn, row.querySelector('.wear')?.textContent.trim());
        });
        view.append(btn);
    });
}

async function handleBuffmarketClick(btn, float) {
    if (btn.dataset.busy) return;
    const assetId = buffmarketAssets.get(float);
    if (!assetId) return throwToast('Item not found, reload the page.', 'error');

    btn.dataset.busy = '1';
    btn.innerHTML = '<div class="loader" style="width:16px"></div>';
    try {
        let code = buffmarketCodes.get(assetId);
        if (!code) {
            const inspectLink = await fetchBuffmarketInspectLink(assetId);
            code = await generateCode(inspectLink);
            buffmarketCodes.set(assetId, code);
        }
        copyToClipBoard(code);
    } catch (err) {
        console.error('Error generating code:', err);
        throwToast(err.message || 'Could not generate !gen for this item.', 'error');
    } finally {
        delete btn.dataset.busy;
        btn.textContent = '!gen';
    }
}

async function fetchBuffmarketInspectLink(assetId) {
    const res = await fetch(`https://api.buff.market/api/market/cs2_inspect?assetid=${assetId}`, { credentials: 'include' });
    const json = await res.json();
    if (json.code === 'Login Required') throw new Error('Log in to BUFF Market first');
    if (json.code !== 'OK' || !json.data) throw new Error('No inspect link found');
    return json.data;
}

function generateCode(inspectLink) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: 'fetch_skin', url: inspectLink }, ({ code, error } = {}) => {
            if (error || !code) reject(new Error(error || 'empty response'));
            else resolve(code);
        });
    });
}

buffmarketReady();
