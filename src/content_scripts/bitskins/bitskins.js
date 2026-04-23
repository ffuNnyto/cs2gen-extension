chrome.runtime.onMessage.addListener(({ action }) => {
    if (action === 'bitskins_loaded' || action === 'web_url_changed') loadBitSkins();
});

function addGenButton(itemCard) {
    const wrapper = itemCard.querySelector('.item-wrapper');
    if (!wrapper || wrapper.querySelector('.gen-bit-btn')) return;

    const btn = document.createElement('button');
    btn.className = 'gen-bit-btn btn btn-primary';
    btn.innerText = '!gen';
    btn.style.cssText = 'position:absolute;top:6px;right:6px;z-index:10;font-size:11px;padding:2px 7px;';

    btn.onclick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (btn.dataset.gen) {
            copyToClipBoard(btn.dataset.gen);
            return;
        }

        btn.innerText = '...';

       
        const btnMore = itemCard.querySelector('.btn-more');
        if (!btnMore) { btn.innerText = '!gen'; return; }
        btnMore.click();

      
        const inspectLink = await waitForInspectLink();

      
        btnMore.click();

        if (!inspectLink) {
            btn.innerText = 'N/A';
            return;
        }

        chrome.runtime.sendMessage({ action: 'fetch_skin', url: inspectLink }, ({ code, error }) => {
            if (error) { btn.innerText = 'err'; return console.error(error); }
            btn.dataset.gen = code;
            btn.innerText = '!gen';
            copyToClipBoard(code);
        });
    };

    wrapper.style.position = 'relative';
    wrapper.appendChild(btn);
}

function waitForInspectLink(timeout = 3000) {
    return new Promise((resolve) => {
        const start = Date.now();
        const interval = setInterval(() => {
            const link = document.querySelector('.item-links a[href^="steam://rungame"]');
            if (link) {
                console.log(link.getAttribute('href'))
                clearInterval(interval);
                resolve(link.getAttribute('href'));
            } else if (Date.now() - start > timeout) {
                clearInterval(interval);
                resolve(null);
            }
        }, 100);
    });
}

function processMarketItems() {
    document.querySelectorAll('.market-items .item').forEach(addGenButton);
}

function observeMarketItems() {
    const targetDiv = document.querySelector('.items-content');
    if (!targetDiv) return;

    new MutationObserver(() => {
        document.querySelectorAll('.market-items .item:not(:has(.gen-bit-btn))').forEach(addGenButton);
    }).observe(targetDiv, { childList: true, subtree: true });
}

function loadBitSkins() {
    new MutationObserver((_, obs) => {
        if (!document.querySelector('.market-items')) return;
        obs.disconnect();
        processMarketItems();
        observeMarketItems();
    }).observe(document.body, { childList: true, subtree: true });

    createToastContainer();
}

function handleLoader(el, active) {
    el.innerHTML = active ? `<div class="loader"></div>` : '!gen';
}