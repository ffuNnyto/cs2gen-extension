chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

    const actions = {
        'csfloat_market_loaded': csfloatReady,
        'csfloat_db_loaded': csfloatdbReady,
        'web_url_changed': ({ url }) => {
            const { pathname, search } = new URL(url);
            if (pathname === '/search' || pathname === '/profile/watchlist') {
                csfloatReady();
            }
            else if (pathname.startsWith("/item/")) { } //TODO: +new target
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
    waitForElement('app-item-container', (targetDiv) => {
        const observer = new MutationObserver(handleMutations);
        observer.observe(targetDiv, { childList: true, subtree: true }); // subtree opcional
        createToastContainer();
    });
}

function waitForElement(selector, callback) {
    const element = document.querySelector(selector);
    if (element) {
        callback(element);
    } else {
        const observer = new MutationObserver((mutations, obs) => {
            const el = document.querySelector(selector);
            if (el) {
                obs.disconnect();
                callback(el);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
}

function handleMutations(mutationsList) {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && node.matches('item-card')) {
                    addGenButton(node);
                } else if (node.nodeType === 1) {
                    const itemCards = node.querySelectorAll?.('item-card');
                    itemCards?.forEach((itemCard, idx) => {
                        addGenButton(itemCard, idx);
                    });
                }
            });
        }
    }
}

function addGenButton(itemCard, idx) {

    try {
        const detailButtons = itemCard.querySelector('.detail-buttons');
        if (!detailButtons) return;


        if (detailButtons.querySelector('.gen-btn')) return;


        const inspectBtn = itemCard.querySelector('a');
        if (!inspectBtn) return;

        const inspectLink = inspectBtn.getAttribute('href');


        const genBtn = createGenButton(idx);
        genBtn.addEventListener('click', async (event) => handleGenButtonClick(event, genBtn, inspectLink, idx));

        detailButtons.append(genBtn);
    }
    catch (err) {


    }
}

async function handleGenButtonClick(event, genBtn, inspectLink, idx) {
    event.stopPropagation();

    if (genBtn.id.startsWith("!g")) {
        copyToClipBoard(genBtn.id);
        return;
    }

    let currentTargetId = genBtn.querySelector(`#gen-btn-${idx}`);

    handleLoader(true, currentTargetId);

    chrome.runtime.sendMessage({ action: "fetch_skin", url: inspectLink }, async (response) => {
        try {
            
            const gen = await getGen(response);

            
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
        <div _ngcontent-ng-c44709137 mattooltip="Inspect In-Game" class="csfloat-g mat-mdc-tooltip-trigger action inspect-link ng-star-inserted" aria-describedby="cdk-describedby-message-ng-1-415" cdk-describedby-host="ng-1" style="">
            <span id="gen-btn-${idx}" _ngcontent-ng-c2631012479="">!g</span>
        </div>
    `;
    return genBtn;
}

function handleLoader(status, targetId) {
    targetId.innerHTML = status ? `<div class="loader"></div>` : "!g";
}