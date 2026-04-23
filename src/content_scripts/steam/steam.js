function getActiveItemInfo() {
    return document.querySelector('#iteminfo0[style*="z-index: 1"], #iteminfo1[style*="z-index: 1"]');
}

function steamInventory() {
    const targetDiv = document.querySelector('.inventory_page_right');
    if (!targetDiv) return;

    new MutationObserver(() => {
        const itemInfo = getActiveItemInfo();
        if (!itemInfo) return;

        if (itemInfo.querySelector('.gen-steam-btn')) return;

        const inspectLink = itemInfo.querySelector('a[href^="steam://run/730"]')?.getAttribute('href');
        if (!inspectLink) return;

        const btn = createButton();
        btn.onclick = () => {
            if (btn.dataset.gen) {
                copyToClipBoard(btn.dataset.gen);
                return;
            }

            handleLoader(true, btn);

            chrome.runtime.sendMessage({ action: 'fetch_skin', url: inspectLink }, ({ code, error }) => {
                if (error) { handleLoader(false, btn); return console.error(error); }
                btn.dataset.gen = code;
                handleLoader(false, btn);
                copyToClipBoard(code);
            });
        };

        itemInfo.querySelector('a[href^="steam://run/730"]')?.parentNode?.appendChild(btn);

    }).observe(targetDiv, { childList: true, subtree: true, attributes: true });
}

function createButton() {
    const btn = document.createElement('button');
    btn.className = 'gen-steam-btn';
    Object.assign(btn.style, {
        cursor: 'pointer',
        display: 'inline-block',
        border: '1px solid #e6e6e6',
        color: 'black',
        borderRadius: '2px',
        fontSize: '12px',
        padding: '2px 6px',
        lineHeight: '18px',
        maxWidth: '120px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    });
    btn.innerHTML = `<span>Copy !Gen</span>`;
    return btn;
}

function handleLoader(el, active) {
    el.innerHTML = active ? `<div class="loader"></div>` : 'Copy !Gen';
}

steamInventory();
setTimeout(() => createToastContainer(), 2000);