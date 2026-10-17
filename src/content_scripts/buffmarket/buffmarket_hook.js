(() => {
    const API_PATTERN = /api\.buff\.market\/api\/market\//;

    function collect(node, out) {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node)) {
            node.forEach((child) => collect(child, out));
            return;
        }

        const info = node.asset_info;
        if (info?.assetid != null && info.paintwear != null) {
            out.push([String(info.paintwear), String(info.assetid)]);
        }

        Object.values(node).forEach((child) => collect(child, out));
    }

    function forward(text) {
        try {
            const items = [];
            collect(JSON.parse(text), items);
            if (items.length) window.postMessage({ source: 'cs2gen', type: 'buff-assets', items }, '*');
        } catch (_) { }
    }

    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        const response = await originalFetch.apply(this, args);
        try {
            if (API_PATTERN.test(String(args[0]?.url || args[0]))) response.clone().text().then(forward);
        } catch (_) { }
        return response;
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
        if (API_PATTERN.test(String(url))) {
            this.addEventListener('load', () => {
                if (this.responseType === '' || this.responseType === 'text') forward(this.responseText);
                else if (this.responseType === 'json' && this.response) forward(JSON.stringify(this.response));
            });
        }
        return originalOpen.apply(this, arguments);
    };
})();
