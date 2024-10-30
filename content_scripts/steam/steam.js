function steamInventory() {

    console.log('[STEAM_INVENTORY_READY]');

    const targetDiv = document.querySelector('.inventory_page_right');

    const observer = new MutationObserver((mutationsList, observer) => {

        const target = mutationsList[0].target

        if (target.classList[1] !== 'app730')
            return


        let inspectButton = target.querySelector('.btn_small.btn_grey_white_innerfade')
        let buttonGen = createButton();

        buttonGen.onclick = () => {
            let inspectLink = inspectButton.getAttribute('href')
            makeApiRequest(true,inspectLink, (encryptedText) => getGen(encryptedText));
        }

        inspectButton.parentNode.appendChild(buttonGen)

    });

    observer.observe(targetDiv, { attributes: true, attributeFilter: ['class'], subtree: true })
}

function createButton() {

    let buttonGen = document.createElement('button')

    Object.assign(buttonGen.style, {
        cursor: 'pointer',
        display: 'inline-block',
        border: ' 1px solid #e6e6e6',
        color: 'black',
        borderRadius: '2px',
        fontSize: ' 12px',
        padding: '2px 6px',
        lineHeight: '18px',
        maxWidth: '120px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    })

    buttonGen.innerHTML = `<div class="get-gen"><span>Copy !Gen</span></div>`

    return buttonGen;

}

steamInventory();


