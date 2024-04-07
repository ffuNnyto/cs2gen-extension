function steamInventory() {

    const targetDiv = document.querySelector('.inventory_page_right');

    const observer = new MutationObserver((mutationsList, observer) => {

        for (let mutation of mutationsList) {

            const addedNodes = mutation.addedNodes

            addedNodes.forEach((node) => {

                if (node.className === 'btn_small btn_grey_white_innerfade') {

                    if (!getCSInventory())
                        return;


                    let buttonGen = createButton();

                    buttonGen.onclick = () => {
                        let inspectLink = node.getAttribute('href')
                        makeApiRequest(inspectLink, (encryptedText) => getGen(encryptedText));
                    }

                    node.parentNode.appendChild(buttonGen)
                }
            })

        }
    });

    observer.observe(targetDiv, { childList: true, attributes: true, subtree: true })
}

function getCSInventory() {

    let logo = document.querySelector('#inventory_applogo')
    return logo.getAttribute('src').includes('/730/')

}

function createButton() {

    let buttonGen = document.createElement('button')

    Object.assign(buttonGen.style, {
        cursor: 'pointer',
        display: 'inline-block',
        border: ' 1px solid #e6e6e6',
        color: 'black',
        borderRadius: '12px',
        fontSize: ' 12px',
        padding: '2px 6px',
        lineHeight: '18px',
        maxWidth: '120px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    })

    buttonGen.innerHTML = `<div><span>Copy !Gen</span></div>`

    return buttonGen;

}

steamInventory();


