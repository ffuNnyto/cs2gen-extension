(() => {
    const API_PATTERN = /sell-orders|load_bots_inventory/;

    function collect(node, out) {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node)) {
            node.forEach((child) => collect(child, out));
            return;
        }

        const link = node.links?.inspectLink || node.inspectLink;
        if (typeof link === 'string' && link.startsWith('steam://')) {
            if (node.id != null) out.push([String(node.id), link]);
            const assetId = node.asset?.id ?? node.assetId;
            if (assetId != null) out.push([String(assetId), link]);
        }

        Object.values(node).forEach((child) => collect(child, out));
    }

    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        const response = await originalFetch.apply(this, args);
        try {
            const url = String(args[0]?.url || args[0]);
            if (API_PATTERN.test(url)) {
                response.clone().json().then((json) => {
                    const items = [];
                    collect(json, items);
                    if (items.length) window.postMessage({ source: 'cs2gen', type: 'inspect-links', items }, '*');
                }).catch(() => { });
            }
        } catch (_) { }
        return response;
    };
})();
