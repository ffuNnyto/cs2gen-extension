document.getElementById('version').textContent = `Version ${chrome.runtime.getManifest().version}`;

const SITE_LABELS = {
    csfloat: 'CSFloat', buff163: 'BUFF163', buffmarket: 'BUFF Market', skinswap: 'SkinSwap',
    csmoney: 'CS.MONEY', steam: 'Steam inventory', link: 'Inspect link',
};

const COPY_ICON = '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></svg>';

const toggles = document.querySelectorAll('input[data-group]');
const positionButtons = document.querySelectorAll('#position button');
const durationSelect = document.getElementById('duration');
const hint = document.getElementById('hint');

const tabButtons = document.querySelectorAll('.tabs [role="tab"]');

function showTab(name) {
    tabButtons.forEach((button) => {
        const active = button.dataset.tab === name;
        button.setAttribute('aria-selected', String(active));
        button.tabIndex = active ? 0 : -1;
        document.getElementById(button.getAttribute('aria-controls')).hidden = !active;
    });
    chrome.storage.local.set({ popupTab: name });
}

tabButtons.forEach((button, index) => {
    button.addEventListener('click', () => showTab(button.dataset.tab));
    button.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
        const next = tabButtons[(index + (event.key === 'ArrowRight' ? 1 : -1) + tabButtons.length) % tabButtons.length];
        next.focus();
        showTab(next.dataset.tab);
    });
});

chrome.storage.local.get('popupTab', ({ popupTab }) => showTab(popupTab === 'history' ? 'history' : 'settings'));

async function save(change) {
    const next = structuredClone(cs2genSettings);
    change(next);
    await cs2genSaveSettings(next);
    hint.hidden = false;
}

function render(settings) {
    toggles.forEach((input) => {
        input.checked = settings[input.dataset.group][input.dataset.key] !== false;
    });
    positionButtons.forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.value === settings.toast.position));
    });
    durationSelect.value = String(settings.toast.duration);
}

cs2genSettingsReady.then((settings) => {
    render(settings);

    toggles.forEach((input) => {
        input.addEventListener('change', () => save((s) => { s[input.dataset.group][input.dataset.key] = input.checked; }));
    });
    positionButtons.forEach((button) => {
        button.addEventListener('click', async () => {
            await save((s) => { s.toast.position = button.dataset.value; });
            render(cs2genSettings);
        });
    });
    durationSelect.addEventListener('change', () => save((s) => { s.toast.duration = Number(durationSelect.value); }));

    document.getElementById('reset').addEventListener('click', async () => {
        await cs2genSaveSettings(structuredClone(CS2GEN_DEFAULTS));
        render(cs2genSettings);
        hint.hidden = false;
    });
});

const historyList = document.getElementById('history');
const historyEmpty = document.getElementById('history-empty');
const clearButton = document.getElementById('clear-history');

function timeAgo(time) {
    const seconds = Math.round((Date.now() - time) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`;
    return `${Math.floor(seconds / 86400)} d ago`;
}

function historyRow(entry) {
    const li = document.createElement('li');
    li.title = 'Click to copy again';

    const item = document.createElement('div');
    item.className = 'item';
    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = SITE_LABELS[entry.site] || 'Item';
    const meta = document.createElement('span');
    meta.className = 'meta';
    meta.textContent = timeAgo(entry.time);
    const code = document.createElement('code');
    code.textContent = entry.code;
    item.append(label, meta, code);

    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'copy';
    copy.setAttribute('aria-label', 'Copy code');
    copy.innerHTML = COPY_ICON;

    li.addEventListener('click', async () => {
        await navigator.clipboard.writeText(entry.code);
        copy.textContent = 'Copied';
        li.classList.add('copied');
        setTimeout(() => { copy.innerHTML = COPY_ICON; li.classList.remove('copied'); }, 1200);
    });

    li.append(item, copy);
    return li;
}

function renderHistory(history = []) {
    historyList.replaceChildren(...history.map(historyRow));
    historyEmpty.hidden = history.length > 0;
    clearButton.hidden = history.length === 0;
}

chrome.storage.local.get('history', ({ history }) => renderHistory(history));
clearButton.addEventListener('click', () => chrome.storage.local.set({ history: [] }, () => renderHistory([])));
