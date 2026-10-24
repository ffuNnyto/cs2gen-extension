document.getElementById('version').textContent = `Version ${chrome.runtime.getManifest().version}`;

const inputs = document.querySelectorAll('input[data-group]');

cs2genSettingsReady.then((settings) => {
    inputs.forEach((input) => {
        input.checked = settings[input.dataset.group][input.dataset.key] !== false;

        input.addEventListener('change', async () => {
            const current = structuredClone(cs2genSettings);
            current[input.dataset.group][input.dataset.key] = input.checked;
            await cs2genSaveSettings(current);
            document.getElementById('hint').hidden = false;
        });
    });
});
