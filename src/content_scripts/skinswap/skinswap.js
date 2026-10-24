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

    setInterval(() => addSkinswapButtons(document), 1000);
}

function addSkinswapButtons(root) {
    if (!cs2genSiteEnabled('skinswap')) return;

    root.querySelectorAll(SKINSWAP_INSPECT_SELECTOR).forEach((link) => {
        const row = link.parentElement;
        const item = row?.parentElement;
        if (!item) return;
        if (item.querySelector('.gen-actions')) return updateFadeBadge(row, item.querySelector('.gen-actions'));

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
        actions.append(genBtn);
        if (cs2genFeatureEnabled('view3d')) actions.append(view3dBtn);

        row.after(actions);
        updateFadeBadge(row, actions);
    });
}

const FADE_LABELS = { fade: 'Fade', 'amber fade': 'Amber Fade', 'acid fade': 'Acid Fade' };
const skinswapFadeCache = new Map();

function updateFadeBadge(row, actions) {
    if (!cs2genFeatureEnabled('fade')) return actions.querySelector('.gen-fade')?.remove();

    const seed = readSkinswapSeed(row);
    const title = document.querySelector('h1')?.textContent.trim();
    const key = `${title}|${seed}`;
    const badge = actions.querySelector('.gen-fade');

    if (seed == null || !title) return badge?.remove();
    if (badge?.dataset.key === key) return;

    const show = (fade) => renderFadeBadge(actions, key, fade);
    if (skinswapFadeCache.has(key)) return show(skinswapFadeCache.get(key));

    try {
        chrome.runtime.sendMessage({ action: 'fade_lookup', title, seed }, (response) => {
            if (chrome.runtime.lastError) return;
            skinswapFadeCache.set(key, response?.fade ?? null);
            if (readSkinswapSeed(row) === seed) show(response?.fade ?? null);
        });
    } catch (_) { }
}

function readSkinswapSeed(row) {
    const labels = [...row.querySelectorAll('p')].filter((p) => p.textContent.includes('/'));
    const match = labels[1]?.textContent.match(/(\d+)\s*$/);
    return match ? Number(match[1]) : null;
}

function renderFadeBadge(actions, key, fade) {
    let badge = actions.querySelector('.gen-fade');
    if (!fade) return badge?.remove();

    if (!badge) {
        badge = document.createElement('span');
        badge.className = 'gen-fade';
        Object.assign(badge.style, {
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
            padding: '2px 8px',
            lineHeight: '16px',
            whiteSpace: 'nowrap',
        });
        actions.prepend(badge);
    }

    const { percentage, ranking, mode } = fade;
    const color = percentage >= 95 ? '#c084fc' : percentage >= 90 ? '#f472b6' : percentage >= 80 ? '#fb923c' : '#fbbf24';
    badge.dataset.key = key;
    badge.textContent = `${FADE_LABELS[mode] || 'Fade'} ${percentage}%`;
    badge.title = ranking ? `Fade rank #${ranking}` : '';
    badge.style.color = color;
    badge.style.border = `1px solid ${color}`;
    badge.style.background = `${color}1f`;
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

cs2genSettingsReady.then(skinswapReady);
