chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

    const actions = {
        'csfloat_market_loaded': csfloatReady,
        'csfloat_db_loaded': csfloatdbReady,
        'web_url_changed': ({ url }) => {
            const { pathname } = new URL(url);
            if (pathname === '/search') csfloatReady();
            else if (pathname === '/db') csfloatdbReady();
        }
    }

    const handleAction = (message) => {
        const action = actions[message.action];
        if (action) action(message);
    }

    handleAction(message);
});





function csfloatReady() {
    console.log('[CSFLOAT_READY]');
    const targetDiv = document.querySelector('app-item-container');
    const observer = new MutationObserver(handleMutations);
    observer.observe(targetDiv, { childList: true });
}

function handleMutations(mutationsList, observer) {
    const findAppItemsContainer = mutationsList.at(-1);
    const itemCards = findAppItemsContainer.target.childNodes[1].querySelectorAll('item-card');
    itemCards.forEach((itemCard) => {
        addGenButton(itemCard);
    });
}

function addGenButton(itemCard) {
    const detailButtons = itemCard.querySelector('.detail-buttons');
    if (!detailButtons) return;

    let genBtnExist = detailButtons.querySelector('.gen-btn');
    if (genBtnExist) return;

    const inspectBtn = itemCard.querySelector('a');
    if (!inspectBtn) return;

    const inspectLink = inspectBtn.getAttribute('href');
    const genBtn = createGenButton(inspectLink);

    genBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        makeApiRequest(true, inspectLink, (encryptedText) => getGen(encryptedText));
    });

    detailButtons.append(genBtn);
}

function createGenButton(inspectLink) {
    const genBtn = document.createElement('span');
    genBtn.innerText = '!g';
    genBtn.className = 'gen-btn';
    genBtn.innerHTML = `
        <div _ngcontent-ng-c3060430395="" mattooltip="Inspect In-Game" class="mat-mdc-tooltip-trigger action inspect-link ng-star-inserted" aria-describedby="cdk-describedby-message-ng-1-415" cdk-describedby-host="ng-1" style="">
            <span _ngcontent-ng-c2631012479="">!g</span>
        </div>
    `;
    return genBtn;
}