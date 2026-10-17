const SKINSWAP_INSPECT_SELECTOR = 'a[href^="steam://"][href*="csgo_econ_action_preview"]';
const SKINSWAP_3D_URL = 'http://3d.chainskins.net/inspect/';

function skinswapReady() {
    createToastContainer();
    addSkinswapButtons(document);

    let timer = null;
    new MutationObserver(() => {
        if (timer) return;
        timer = setTimeout(() => {
            timer = null;
            addSkinswapButtons(document);
        }, 100);
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });

    // safety net: SkinSwap re-renders rows on pagination/filter changes
    setInterval(() => addSkinswapButtons(document), 1000);
}

function addSkinswapButtons(root) {
    root.querySelectorAll(SKINSWAP_INSPECT_SELECTOR).forEach((link) => {
        const row = link.parentElement;
        const item = row?.parentElement;
        if (!item || item.querySelector('.gen-actions')) return;

        // read the href at click time: React may reuse this row for another item
        const currentHref = () => row.querySelector(SKINSWAP_INSPECT_SELECTOR)?.getAttribute('href');

        const genBtn = createSkinswapButton('!gen');
        genBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const href = currentHref();
            if (href) handleSkinswapGenClick(genBtn, href);
        });

        const view3dBtn = createSkinswapButton('3D');
        view3dBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const href = currentHref();
            if (href) window.open(SKINSWAP_3D_URL + href, '_blank', 'noopener');
        });

        const actions = document.createElement('div');
        actions.className = 'gen-actions';
        Object.assign(actions.style, { display: 'flex', alignItems: 'center', gap: '6px', flexShrink: '0' });
        actions.append(genBtn, view3dBtn);

        // empty space between the instant badge and the price
        row.after(actions);
    });
}

function createSkinswapButton(label) {
    const btn = document.createElement('span');
    btn.className = 'gen-btn';
    btn.textContent = label;
    Object.assign(btn.style, {
        cursor: 'pointer',
        border: '1px solid #959595',
        color: '#959595',
        borderRadius: '12px',
        fontSize: '12px',
        padding: '2px 8px',
        lineHeight: '16px',
        whiteSpace: 'nowrap',
    });
    return btn;
}

function handleSkinswapGenClick(btn, inspectLink) {
    if (btn.dataset.busy) return;
    if (btn.dataset.href === inspectLink) return copyToClipBoard(btn.dataset.code);

    btn.dataset.busy = '1';
    btn.innerHTML = '<div class="loader" style="width:16px"></div>';
    chrome.runtime.sendMessage({ action: 'fetch_skin', url: inspectLink }, ({ code, error } = {}) => {
        delete btn.dataset.busy;
        btn.textContent = '!gen';
        if (error || !code) return console.error('Error generating code:', error);
        btn.dataset.href = inspectLink;
        btn.dataset.code = code;
        copyToClipBoard(code);
    });
}

skinswapReady();
