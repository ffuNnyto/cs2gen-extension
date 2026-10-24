const TOAST_DEFAULT_SECONDS = 4;
const TOAST_MAX_VISIBLE = 3;

const TOAST_TYPES = {
    success: {
        title: 'Copied',
        color: '#22c55e',
        icon: '<circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.7 2.7L16 9.8" />',
    },
    error: {
        title: 'Something went wrong',
        color: '#ef4444',
        icon: '<circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5" /><path d="M12 16.5h.01" />',
    },
    info: {
        title: 'CS2 !gen',
        color: '#3b82f6',
        icon: '<circle cx="12" cy="12" r="9" /><path d="M12 11v5.5" /><path d="M12 7.5h.01" />',
    },
};

const TOAST_STYLES = `
    :host { all: initial; }
    .stack {
        --enter: 16px;
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 2147483647;
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: min(340px, calc(100vw - 32px));
        pointer-events: none;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, sans-serif;
    }
    .stack[data-pos$="left"] { --enter: -16px; right: auto; left: 16px; }
    .stack[data-pos^="bottom"] { top: auto; bottom: 16px; }
    .toast {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 12px 12px 12px 14px;
        border: 1px solid #2a2d38;
        border-radius: 10px;
        background: #16181f;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
        color: #f3f4f6;
        pointer-events: auto;
        opacity: 0;
        transform: translateX(var(--enter));
        transition: opacity 0.2s ease, transform 0.25s ease;
    }
    .toast.show { opacity: 1; transform: none; }
    .toast.hide { opacity: 0; transform: translateX(var(--enter)); }
    .icon { flex: none; width: 18px; height: 18px; margin-top: 1px; fill: none; stroke: var(--color); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .body { flex: 1; min-width: 0; }
    .title { font-size: 13px; font-weight: 600; line-height: 1.4; }
    .message { font-size: 12.5px; line-height: 1.4; color: #a1a7b5; word-break: break-word; }
    .detail {
        display: block;
        margin-top: 6px;
        font: 11.5px/1.4 ui-monospace, SFMono-Regular, Consolas, monospace;
        color: #d1d5db;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .close {
        flex: none;
        width: 20px;
        height: 20px;
        border: 0;
        border-radius: 5px;
        background: transparent;
        color: #7b8190;
        cursor: pointer;
        display: grid;
        place-items: center;
    }
    .close:hover { background: #262a35; color: #f3f4f6; }
    .close svg { width: 10px; height: 10px; stroke: currentColor; stroke-width: 2; stroke-linecap: round; fill: none; }
    @media (prefers-reduced-motion: reduce) {
        .toast, .toast.show, .toast.hide { transition: opacity 0.15s ease; transform: none; }
    }
`;

let toastStack = null;

function createToastContainer() {
    if (toastStack?.isConnected) return toastStack;

    const host = document.createElement('div');
    host.id = 'cs2gen-toast-host';
    const shadow = host.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = TOAST_STYLES;
    toastStack = document.createElement('div');
    toastStack.className = 'stack';
    shadow.append(style, toastStack);

    document.documentElement.appendChild(host);
    return toastStack;
}

function throwToast(message, type = 'success', detail = '') {
    const stack = createToastContainer();
    const options = (typeof cs2genSettings !== 'undefined' && cs2genSettings.toast) || {};
    stack.dataset.pos = options.position || 'top-right';
    const seconds = Number(options.duration) || TOAST_DEFAULT_SECONDS;
    const config = TOAST_TYPES[type] || TOAST_TYPES.info;

    const key = `${type}|${message}|${detail}`;
    stack.querySelectorAll('.toast').forEach((existing) => {
        if (existing.dataset.key === key) dismissToast(existing, true);
    });

    const live = () => [...stack.children].filter((el) => !el.classList.contains('hide'));
    while (live().length >= TOAST_MAX_VISIBLE) dismissToast(live()[0]);

    const toast = document.createElement('div');
    toast.dataset.key = key;
    toast.className = 'toast';
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    toast.style.setProperty('--color', config.color);

    toast.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24">${config.icon}</svg>
        <div class="body">
            <div class="title"></div>
            <div class="message"></div>
            ${detail ? '<code class="detail"></code>' : ''}
        </div>
        <button class="close" aria-label="Close"><svg viewBox="0 0 12 12"><path d="M2 2l8 8M10 2l-8 8" /></svg></button>
    `;
    toast.querySelector('.title').textContent = config.title;
    toast.querySelector('.message').textContent = message;
    if (detail) toast.querySelector('.detail').textContent = detail;
    toast.querySelector('.close').addEventListener('click', () => dismissToast(toast));
    setTimeout(() => dismissToast(toast), seconds * 1000);

    stack.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
}

function dismissToast(toast, immediate = false) {
    if (!toast || toast.classList.contains('hide')) return;
    toast.classList.add('hide');
    if (immediate) return toast.remove();
    setTimeout(() => toast.remove(), 350);
}
