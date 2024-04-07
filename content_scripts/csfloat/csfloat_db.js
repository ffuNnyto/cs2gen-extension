

function createGButton(node) {

    if (!node) return;
    if (node.querySelector('.db-class-gen')) return;

    const inspectElementA = node.querySelector('a[href^="steam"]');

    if (!inspectElementA) return;

    const inspectLink = inspectElementA.getAttribute('href');
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

    node.firstChild.appendChild(genBtn);
}


function availableItems() { //when /db open its already with renderized items

    const targetTBody = document.querySelector('tbody[role="rowgroup"]');
    let children = targetTBody.childNodes;
    children.forEach((node) => createGButton(node.childNodes[6]))
}



function csfloatdbReady() {

    const targetDiv = document.querySelector('app-float-dbtable');
    targetDiv.addEventListener('DOMNodeInserted', function (event) {
        if (event.target && event.target.nodeName === 'TR')
            setTimeout(() => createGButton(event.target.childNodes[6]), 500);
    });


}


