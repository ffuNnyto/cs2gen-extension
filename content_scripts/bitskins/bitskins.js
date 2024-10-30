
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'bitskins_loaded')
        loadBitSkins();
    else if (message.action === 'web_url_changed')
        loadBitSkins();
});



function createGenButton(itemMenu) {

    const settingsButton = itemMenu.querySelector('.btn.btn-primary.btn-om.btn-more');

    if (!settingsButton)
        return

    settingsButton.addEventListener('click', () => {

        const itemLinks = document.querySelector('.item-links');

        if (!itemLinks || itemLinks.querySelector('#gen_bit_button'))
            return;


        const genButton = document.createElement('div');

        genButton.id = 'gen_bit_button';

        const inspectLink = itemLinks.childNodes[4].getAttribute('href');

        genButton.onclick = () => makeApiRequest(inspectLink, (encryptedText) => getGen(encryptedText));

        genButton.innerHTML = `
            <span class="flex-row" rel="nofollow noopener noreferrer" target="_blank">
                <img src="/assets/arrow-full-right-white-J3wjj7Av.svg" class="mr-15" alt="icon">
                <span>Copy !gen</span>
            </span>
        `;
        itemLinks.appendChild(genButton);

    });

}


function marketItemsMutationHandler(mutationsList) {
    for (let mutation of mutationsList) {
        if (mutation.target.innerHTML.includes('market-items')) {
            const itemCards = mutation.target.querySelector('.market-items');
            itemCards.childNodes.forEach((itemCard) => {
                const itemMenu = itemCard.childNodes[1];
                if (!itemMenu) return;
                createGenButton(itemMenu);
            });
        }
    }
}


function observeMarketItems() {
    const targetDiv = document.querySelector('.items-content');
    const observer = new MutationObserver(marketItemsMutationHandler);
    observer.observe(targetDiv, { childList: true, attributes: true, attributeFilter: ['class'] });
}


function availableItemsMutationHandler(node) {
    const itemCards = node.childNodes[3];
    itemCards.childNodes.forEach((itemCard) => {
        const itemMenu = itemCard.childNodes[1];
        if (!itemMenu) return;
        createGenButton(itemMenu);
    });
}


function loadBitSkins() {
    console.log('[BITSKINS_READY]');
    const observer = new MutationObserver((mutationsList, observer) => {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList' && document.querySelector('.market-items')) {
                availableItemsMutationHandler(mutation.target);
                observeMarketItems();
                observer.disconnect();
                break;
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}
