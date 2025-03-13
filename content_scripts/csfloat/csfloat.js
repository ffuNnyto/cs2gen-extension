chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

    const actions = {
        'csfloat_market_loaded': csfloatReady,
        'csfloat_db_loaded': csfloatdbReady,
        'web_url_changed': ({ url }) => {
            const { pathname, search } = new URL(url);
            if (pathname === '/search' || pathname==='/profile/watchlist') {
                csfloatReady();
            }
            else if (pathname.startsWith("/item/")) {
                
                
               
            }
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
    createToastContainer();



}

function handleMutations(mutationsList, observer) {
    const findAppItemsContainer = mutationsList.at(-1);
    const itemCards = findAppItemsContainer.target.childNodes[1].querySelectorAll('item-card');
    itemCards.forEach((itemCard, idx) => {
        addGenButton(itemCard, idx);
    });
}

function addGenButton(itemCard, idx) {

    const detailButtons = itemCard.querySelector('.detail-buttons');
    if (!detailButtons) return;


    if (detailButtons.querySelector('.gen-btn')) return;


    const inspectBtn = itemCard.querySelector('a');
    if (!inspectBtn) return;

    const inspectLink = inspectBtn.getAttribute('href');


    const genBtn = createGenButton(idx);
    genBtn.addEventListener('click', async (event) => handleGenButtonClick(event, genBtn, inspectLink, idx));

    detailButtons.append(genBtn);

    /*itemCard.addEventListener('click', () => {
        const observer = new MutationObserver((mutationsList, observer) => {
             const popupWindow = document.querySelector('.grid-item');
 
             if (popupWindow) {
 
                 observer.disconnect();
 
                 popupWindow.addEventListener('load', () => { });
                 console.log(popupWindow)
 
                 const genBtn2 = createGenButton(idx);
                 genBtn2.addEventListener('click', async (event) => handleGenButtonClick(event, genBtn2, inspectLink, idx));
 
 
                 popupWindow.querySelector('.detail-buttons').append(genBtn2)
             }
         });
         observer.observe(document.body, { childList: true, subtree: true });


    })*/
}

async function handleGenButtonClick(event, genBtn, inspectLink, idx) {
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
}

function createGenButton(idx) {
    const genBtn = document.createElement('span');
    genBtn.innerText = '!g';
    genBtn.className = 'gen-btn';
    genBtn.innerHTML = `
        <div _ngcontent-ng-c3060430395="" mattooltip="Inspect In-Game" class="mat-mdc-tooltip-trigger action inspect-link ng-star-inserted" aria-describedby="cdk-describedby-message-ng-1-415" cdk-describedby-host="ng-1" style="">
            <span id="gen-btn-${idx}" _ngcontent-ng-c2631012479="">!g</span>
        </div>
    `;
    return genBtn;
}

function handleLoader(status, targetId) {
    targetId.innerHTML = status ? `<div class="loader"></div>` : "!g";
}