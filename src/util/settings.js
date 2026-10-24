const CS2GEN_DEFAULTS = {
    sites: { csfloat: true, buff163: true, buffmarket: true, skinswap: true, csmoney: true, steam: true },
    features: { view3d: true, fade: true },
};

const CS2GEN_HOSTS = {
    'csfloat.com': 'csfloat',
    'buff.163.com': 'buff163',
    'buff.market': 'buffmarket',
    'skinswap.com': 'skinswap',
    'cs.money': 'csmoney',
    'steamcommunity.com': 'steam',
};

// everything the content scripts inject, so it can be removed when a site gets switched off
const CS2GEN_INJECTED = '.gen-btn, .gen-actions, .gen-fade, .db-class-gen, .gen-steam-btn';

let cs2genSettings = structuredClone(CS2GEN_DEFAULTS);

function cs2genMerge(saved) {
    return {
        sites: { ...CS2GEN_DEFAULTS.sites, ...saved?.sites },
        features: { ...CS2GEN_DEFAULTS.features, ...saved?.features },
    };
}

// resolves once the saved settings are loaded; until then everything counts as enabled
const cs2genSettingsReady = new Promise((resolve) => {
    try {
        chrome.storage.sync.get('settings', ({ settings }) => {
            cs2genSettings = cs2genMerge(settings);
            resolve(cs2genSettings);
        });
    } catch (_) {
        resolve(cs2genSettings);
    }
});

function cs2genSiteEnabled(site) {
    return cs2genSettings.sites[site] !== false;
}

function cs2genFeatureEnabled(feature) {
    return cs2genSettings.features[feature] !== false;
}

function cs2genSaveSettings(settings) {
    cs2genSettings = settings;
    return chrome.storage.sync.set({ settings });
}

try {
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'sync' || !changes.settings) return;
        cs2genSettings = cs2genMerge(changes.settings.newValue);

        // site switched off: take its buttons off the page right away (switching on needs a reload)
        const site = CS2GEN_HOSTS[location.hostname.replace(/^www\./, '')];
        if (site && !cs2genSiteEnabled(site)) {
            document.querySelectorAll(CS2GEN_INJECTED).forEach((el) => el.remove());
        }
    });
} catch (_) { }
