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

            if (buttonGen.id.startsWith("!g")) {
                copyToClipBoard(buttonGen.id);
                return;
            }

            handleLoader(true, buttonGen);

            let inspectLink = inspectButton.getAttribute('href')

            makeApiRequest(true, inspectLink, async (encryptedText) => {
                try {
                    const gen = await getGen(encryptedText);
                    buttonGen.id = gen;
                    copyToClipBoard(gen);
                    handleLoader(false, buttonGen);
                } catch (error) {
                    console.error('Error generating code:', error);
                }
            });
        }

        inspectButton.parentNode.appendChild(buttonGen)

    });

    observer.observe(targetDiv, { attributes: true, attributeFilter: ['class'], subtree: true })

}

function createButton(idx) {

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

    buttonGen.innerHTML = `<div id="" class="get-gen"><span>Copy !Gen</span></div>`

    return buttonGen;

}
function handleLoader(status, targetId) {
    targetId.innerHTML = status ? `<div class="loader"></div>` : "Copy !gen";
}
steamInventory();
setTimeout(() => {
    createToastContainer();
}, 2000)


