chrome.runtime.onMessage.addListener(({ action, url }) => {
    const handlers = {
        csfloat_market_loaded: csfloatReady,
        csfloat_db_loaded: csfloatdbReady,
        web_url_changed: () => {
            const { pathname } = new URL(url);
            if (pathname === '/search' || pathname === '/profile/watchlist') csfloatReady();
            else if (pathname === '/db') csfloatdbReady();
        }
    };
    handlers[action]?.();
});

function csfloatReady() {
    waitForElement('app-item-container', (container) => {
        new MutationObserver(handleMutations).observe(container, { childList: true, subtree: true });
        createToastContainer();
    });
}

function waitForElement(selector, callback) {
    const el = document.querySelector(selector);
    if (el) return callback(el);

    const observer = new MutationObserver((_, obs) => {
        const el = document.querySelector(selector);
        if (!el) return;
        obs.disconnect();
        callback(el);
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

function handleMutations(mutations) {
    for (const { addedNodes } of mutations) {
        addedNodes.forEach((node) => {
            if (node.nodeType !== 1) return;
            if (node.matches('item-card')) addGenButton(node);
            else node.querySelectorAll?.('item-card').forEach(addGenButton);
        });
    }
}

function addGenButton(itemCard, idx) {
    try {
        const detailButtons = itemCard.querySelector('.detail-buttons');
        if (!detailButtons || detailButtons.querySelector('.gen-btn')) return;

        const inspectLink = itemCard.querySelector('a')?.getAttribute('href');
        if (!inspectLink) return;

        const genBtn = createGenButton(idx);
        genBtn.addEventListener('click', (e) => handleGenButtonClick(e, genBtn, inspectLink, idx));
        detailButtons.append(genBtn);
    } catch (_) {}
}

async function handleGenButtonClick(event, genBtn, inspectLink, idx) {
    event.stopPropagation();

    if (genBtn.id.startsWith('!g')) {
        copyToClipBoard(genBtn.id);
        return;
    }

    const target = genBtn.querySelector(`#gen-btn-${idx}`);
    handleLoader(true, target);

    chrome.runtime.sendMessage({ action: 'fetch_skin', url: inspectLink }, ({ code, error }) => {
        if (error) return console.error('Error generating code:', error);
        genBtn.id = code;
        copyToClipBoard(code);
        handleLoader(false, target);
    });
}

function createGenButton(idx) {
    const btn = document.createElement('span');
    btn.className = 'gen-btn';
    btn.innerHTML = `
        <div class="csfloat-g mat-mdc-tooltip-trigger action inspect-link ng-star-inserted">
            <span id="gen-btn-${idx}">!g</span>
        </div>
    `;
    return btn;
}

function handleLoader(el, active) {
    el.innerHTML = active ? `<div class="loader"></div>` : '!g';
}