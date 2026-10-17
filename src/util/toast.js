const TOAST_DURATION = 4500;
const TOAST_MAX_VISIBLE = 3;

const TOAST_TYPES = {
    success: {
        title: 'Copied',
        color: '#34d399',
        icon: '<path d="M5 12.5l4.5 4.5L19 7.5" />',
    },
    error: {
        title: 'Something went wrong',
        color: '#f87171',
        icon: '<path d="M12 7v6" /><path d="M12 17h.01" />',
    },
    info: {
        title: 'CS2 !gen',
        color: '#60a5fa',
        icon: '<path d="M12 11v6" /><path d="M12 7h.01" />',
    },
};

const TOAST_STYLES = `
    :host { all: initial; }
    .stack {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 2147483647;
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: min(360px, calc(100vw - 40px));
        pointer-events: none;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, sans-serif;
    }
    .toast {
        --accent: #34d399;
        position: relative;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 14px 14px 16px 14px;
        border-radius: 12px;
        background: rgba(17, 20, 28, 0.94);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        color: #f3f4f6;
        overflow: hidden;
        pointer-events: auto;
        opacity: 0;
        transform: translateX(24px) scale(0.98);
        transition: opacity 0.28s ease, transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .toast.show { opacity: 1; transform: none; }
    .toast.hide { opacity: 0; transform: translateX(24px) scale(0.98); }
    .badge {
        flex: none;
        width: 30px;
        height: 30px;
        border-radius: 9px;
        display: grid;
        place-items: center;
        color: var(--accent);
        background: color-mix(in srgb, var(--accent) 16%, transparent);
    }
    .badge svg {
        width: 18px;
        height: 18px;
        fill: none;
        stroke: currentColor;
        stroke-width: 2.4;
        stroke-linecap: round;
        stroke-linejoin: round;
    }
    .body { flex: 1; min-width: 0; padding-top: 1px; }
    .title { font-size: 13.5px; font-weight: 600; line-height: 1.3; letter-spacing: 0.01em; }
    .message { margin-top: 2px; font-size: 12.5px; line-height: 1.4; color: #aab0bd; word-break: break-word; }
    .detail {
        margin-top: 8px;
        padding: 5px 8px;
        border-radius: 6px;
        font: 11.5px/1.3 ui-monospace, SFMono-Regular, Consolas, monospace;
        color: #d1d5db;
        background: rgba(255, 255, 255, 0.06);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .close {
        flex: none;
        width: 22px;
        height: 22px;
        margin: -2px -2px 0 0;
        border: 0;
        border-radius: 6px;
        background: transparent;
        color: #7b8190;
        cursor: pointer;
        display: grid;
        place-items: center;
        transition: background 0.15s ease, color 0.15s ease;
    }
    .close:hover { background: rgba(255, 255, 255, 0.08); color: #f3f4f6; }
    .close svg { width: 12px; height: 12px; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; fill: none; }
    .progress {
        position: absolute;
        left: 0;
        bottom: 0;
        height: 3px;
        width: 100%;
        background: var(--accent);
        opacity: 0.85;
        transform-origin: left;
        animation: shrink var(--duration) linear forwards;
    }
    .toast:hover .progress { animation-play-state: paused; }
    @keyframes shrink { from { transform: scaleX(1); } to { transform: scaleX(0); } }
    @media (prefers-reduced-motion: reduce) {
        .toast, .toast.show, .toast.hide { transition: opacity 0.2s ease; transform: none; }
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
    toast.style.setProperty('--accent', config.color);
    toast.style.setProperty('--duration', `${TOAST_DURATION}ms`);

    toast.innerHTML = `
        <div class="badge"><svg viewBox="0 0 24 24">${config.icon}</svg></div>
        <div class="body">
            <div class="title"></div>
            <div class="message"></div>
            ${detail ? '<div class="detail"></div>' : ''}
        </div>
        <button class="close" aria-label="Close"><svg viewBox="0 0 12 12"><path d="M2 2l8 8M10 2l-8 8" /></svg></button>
        <div class="progress"></div>
    `;
    toast.querySelector('.title').textContent = config.title;
    toast.querySelector('.message').textContent = message;
    if (detail) toast.querySelector('.detail').textContent = detail;
    toast.querySelector('.close').addEventListener('click', () => dismissToast(toast));
    toast.querySelector('.progress').addEventListener('animationend', () => dismissToast(toast));

    stack.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
}

function dismissToast(toast, immediate = false) {
    if (!toast || toast.classList.contains('hide')) return;
    toast.classList.add('hide');
    if (immediate) return toast.remove();
    setTimeout(() => toast.remove(), 350);
}
