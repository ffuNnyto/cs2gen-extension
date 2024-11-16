

function createGButton(node,idx) {

    if (!node || node.querySelector('.db-class-gen'))
        return;

    const inspectButton = node.querySelector('a[href^="steam"]');

    if (!inspectButton) return;

    const inspectLink = inspectButton.getAttribute('href');
    const genBtn = document.createElement('div');

    genBtn.className = 'db-class-gen';
    genBtn.onclick = (event) => {
        event.stopPropagation();

        if (genBtn.id.startsWith("!g")) {
            copyToClipBoard(genBtn.id);
            return;
        }

        let currentTargetId = genBtn.querySelector(`#gen-btn-${idx}`);

        handleLoader(true, currentTargetId);

        makeApiRequest(true, inspectLink, async (encryptedText) => {
            try {
                const gen = await getGen(encryptedText);
                genBtn.id = gen;
                copyToClipBoard(gen);
                handleLoader(false, currentTargetId);
            } catch (error) {
                console.error('Error generating code:', error);
            }
        });

    };

    genBtn.innerHTML = `
        <div class="mat-mdc-tooltip-trigger">
            <button mat-icon-button mat-ripple-loader-class-name="mat-mdc-button-ripple" class="mdc-icon-button mat-mdc-icon-button mat-unthemed mat-mdc-button-base">
                <span class="mat-mdc-button-persistent-ripple mdc-icon-button__ripple"></span>
                <span id="gen-btn-${idx}">!g</span>
            </button>
        </div>
    `;



    node.querySelector('.actions').appendChild(genBtn)
}

function trackTable() {

    const targetDiv = document.querySelector('tbody[role="rowgroup"]')
    const observer = new MutationObserver((mutationsList, observer) => {

        var i =0;
        for (var mutation of mutationsList) {
            var newNode = mutation.addedNodes[0]
            createGButton(newNode,i)
            i++;
        }
    })
    observer.observe(targetDiv, { childList: true })

}

function csfloatdbReady() {
    console.log('[CSFLOAT_DB_READY]');
    const observer = new MutationObserver((mutationsList, observer) => {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                if (document.querySelector('tbody[role="rowgroup"]')) {
                    availableItems();
                    trackTable();
                    observer.disconnect();
                    break;
                }
            }
        }
    })
    observer.observe(document.body, { childList: true, subtree: true });


}

function availableItems() { //when /db open its already with renderized items

    const targetTBody = document.querySelector('tbody[role="rowgroup"]');
    let children = targetTBody.childNodes;
    children.forEach((node) => createGButton(node.childNodes[6]))
}

function handleLoader(status, targetId) {
    targetId.innerHTML = status ? `<div class="loader"></div>` : "!g";
}