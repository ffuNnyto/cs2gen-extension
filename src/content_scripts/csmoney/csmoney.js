const CSMONEY_CARD_SELECTOR = '[data-card-item-id]';
const csmoneyInspectCache = new Map();
const csmoneyLinks = new Map();

function csmoneyReady() {
    createToastContainer();
    addCsmoneyButtons(document);

    let timer = null;
    new MutationObserver(() => {
        if (timer) return;
        timer = setTimeout(() => {
            timer = null;
            addCsmoneyButtons(document);
        }, 100);
    }).observe(document.body, { childList: true, subtree: true });
}

function addCsmoneyButtons(root) {
    if (!cs2genSiteEnabled('csmoney')) return;

    root.querySelectorAll(CSMONEY_CARD_SELECTOR).forEach((card) => {
        if (card.querySelector(':scope > .gen-btn')) return;

        const btn = createCsmoneyButton();
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // read the id at click time: the list is virtualized and cards get reused
            handleCsmoneyClick(btn, card);
        });

        if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
        card.append(btn);
    });
}

function createCsmoneyButton() {
    const btn = document.createElement('span');
    btn.className = 'gen-btn';
    btn.textContent = '!gen';
    Object.assign(btn.style, {
        position: 'absolute',
        top: '6px',
        right: '6px',
        zIndex: '5',
        cursor: 'pointer',
        border: '1px solid #959595',
        background: 'rgba(0, 0, 0, 0.6)',
        color: '#d0d0d0',
        borderRadius: '12px',
        fontSize: '11px',
        padding: '1px 7px',
        lineHeight: '16px',
    });
    return btn;
}

async function handleCsmoneyClick(btn, card) {
    const assetId = card.dataset.cardItemId;
    const detailUrl = card.querySelector(`a[href*="/${assetId}/"]`)?.href;
    if (!assetId || btn.dataset.busy) return;

    btn.dataset.busy = '1';
    btn.innerHTML = '<div class="loader" style="width:16px"></div>';
    try {
        let code = csmoneyInspectCache.get(assetId);
        if (!code) {
            const inspectLink = csmoneyLinks.get(assetId) || findInspectLinkInPage(assetId) || await fetchInspectLink(assetId, detailUrl);
            if (!inspectLink) throw new Error('No inspect link found');
            code = await generateCode(inspectLink);
            csmoneyInspectCache.set(assetId, code);
        }
        copyToClipBoard(code);
    } catch (err) {
        console.error('Error generating code:', err);
        throwToast('Could not generate !gen for this item.', 'error');
    } finally {
        delete btn.dataset.busy;
        btn.textContent = '!gen';
    }
}

window.addEventListener('message', ({ source, data }) => {
    if (source !== window || data?.source !== 'cs2gen' || data.type !== 'inspect-links') return;
    data.items.forEach(([id, link]) => csmoneyLinks.set(String(id), link));
});


function findInspectLinkInPage(assetId) {
    const json = document.getElementById('__page-params')?.textContent;
    if (!json) return null;

    try {
        const items = [];
        collectInspectLinks(JSON.parse(json), items);
        items.forEach(([id, link]) => csmoneyLinks.set(id, link));
        if (csmoneyLinks.has(assetId)) return csmoneyLinks.get(assetId);
    } catch (_) { }

    return extractInspectLink(json, assetId);
}

function collectInspectLinks(node, out) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach((child) => collectInspectLinks(child, out));

    const link = node.links?.inspectLink || node.inspectLink;
    if (typeof link === 'string' && link.startsWith('steam://')) {
        if (node.id != null) out.push([String(node.id), link]);
        const assetId = node.asset?.id ?? node.assetId;
        if (assetId != null) out.push([String(assetId), link]);
    }

    Object.values(node).forEach((child) => collectInspectLinks(child, out));
}


async function fetchInspectLink(assetId, detailUrl) {
    if (!detailUrl) return null;
    const res = await fetch(detailUrl, { credentials: 'include' });
    if (!res.ok) return null;
    return extractInspectLink(await res.text(), assetId);
}

function extractInspectLink(text, assetId) {
   
    const assetAt = text.search(new RegExp('assetId.{1,3}' + assetId + '(?!\\d)'));
    if (assetAt === -1) return null;

    const chunk = text.slice(assetAt, assetAt + 4000);
    return chunk.match(/steam:\/\/run\/730\/\/\+csgo_econ_action_preview%20[0-9A-Fa-f]+/)?.[0] ?? null;
}

function generateCode(inspectLink) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: 'fetch_skin', url: inspectLink }, ({ code, error } = {}) => {
            if (error || !code) reject(new Error(error || 'empty response'));
            else resolve(code);
        });
    });
}

cs2genSettingsReady.then(csmoneyReady);
