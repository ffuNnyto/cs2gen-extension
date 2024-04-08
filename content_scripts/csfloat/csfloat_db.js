

function createGButton(node) {
    
    if (!node || node.querySelector('.db-class-gen'))
        return;

    const inspectButton = node.querySelector('a[href^="steam"]');

    if (!inspectButton) return;

    const inspectLink = inspectButton.getAttribute('href');
    const genBtn = document.createElement('div');

    genBtn.className = 'db-class-gen';
    genBtn.onclick = (event) => {
        event.stopPropagation();
        makeApiRequest(inspectLink, (encryptedText) => getGen(encryptedText));
    };

    genBtn.innerHTML = `
        <div class="mat-mdc-tooltip-trigger">
            <button mat-icon-button mat-ripple-loader-class-name="mat-mdc-button-ripple" class="mdc-icon-button mat-mdc-icon-button mat-unthemed mat-mdc-button-base">
                <span class="mat-mdc-button-persistent-ripple mdc-icon-button__ripple"></span>
                <span>!g</span>
            </button>
        </div>
    `;



    node.querySelector('.actions').appendChild(genBtn)
}

function trackTable() {

    const targetDiv = document.querySelector('tbody[role="rowgroup"]')
    const observer = new MutationObserver((mutationsList, observer) => {

        for (var mutation of mutationsList) {
            var newNode = mutation.addedNodes[0]
            createGButton(newNode)
        }
    })
    observer.observe(targetDiv, { childList: true })

}

function csfloatdbReady() {
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


