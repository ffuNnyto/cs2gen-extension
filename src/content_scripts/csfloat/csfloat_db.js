function createGButton(node, idx) {
    if (!node || node.querySelector('.db-class-gen')) return;

    const inspectLink = node.querySelector('a[href^="steam"]')?.getAttribute('href');
    if (!inspectLink) return;

    const genBtn = document.createElement('div');
    genBtn.className = 'db-class-gen';
    genBtn.innerHTML = `
        <div class="mat-mdc-tooltip-trigger">
            <button class="mdc-icon-button mat-mdc-icon-button mat-unthemed mat-mdc-button-base">
                <span class="mdc-icon-button__ripple"></span>
                <span id="gen-btn-${idx}">!g</span>
            </button>
        </div>
    `;

    genBtn.onclick = (e) => {
        e.stopPropagation();

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
    };

    node.querySelector('.actions')?.appendChild(genBtn);
}

function trackTable() {
    const tbody = document.querySelector('tbody[role="rowgroup"]');
    let i = 0;
    new MutationObserver((mutations) => {
        for (const { addedNodes } of mutations) {
            createGButton(addedNodes[0], i++);
        }
    }).observe(tbody, { childList: true });
}

function csfloatdbReady() {
    new MutationObserver((_, obs) => {
        if (!document.querySelector('tbody[role="rowgroup"]')) return;
        obs.disconnect();
        availableItems();
        trackTable();
    }).observe(document.body, { childList: true, subtree: true });
    createToastContainer();
}

function availableItems() {
    document.querySelector('tbody[role="rowgroup"]')
        ?.childNodes.forEach((node) => createGButton(node.childNodes[6]));
}

function handleLoader(el, active) {
    el.innerHTML = active ? `<div class="loader"></div>` : '!g';
}