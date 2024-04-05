chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    
    const actions = {
        'csfloat_market_loaded': csfloatReady,
        'csfloat_db_loaded': () => { csfloatdbReady(); availableItems(); },
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



    const targetDiv = document.querySelector('app-item-container')

    if (!targetDiv) {

        console.log("NO DETECTED")
        return;
    }


    targetDiv.addEventListener('DOMNodeInserted', function (event) {

        if (event.target && event.target.nodeName === 'ITEM-CARD') {


            const detailButtons = event.target.querySelector('.detail-buttons')

            setTimeout(() => {

                let g = detailButtons.querySelector('.gen-btn')
                if (g)
                    return;

                let inspectLink = detailButtons.querySelector('a[_ngcontent-ng-c2631012479]').getAttribute('href')
                const genBtn = document.createElement('span');

                genBtn.innerText = '!g';
                genBtn.className = 'gen-btn'

                genBtn.innerHTML = `
                    <span _ngcontent-ng-c2631012479="" mattooltip="Inspect In-Game" class="mat-mdc-tooltip-trigger action inspect-link ng-star-inserted" aria-describedby="cdk-describedby-message-ng-1-415" cdk-describedby-host="ng-1" style="">
                        <span _ngcontent-ng-c2631012479="">!g</span>
                    </span>
                `

                genBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    makeApiRequest(inspectLink, (encryptedText) => getGen(encryptedText))
                });

                detailButtons.append(genBtn)


            }, 500)

        }
    });
}


/**
 * 
 * 
 * 
 * 
 * 
 * 
 * function csfloatReady() {
    const detectTargetDiv = () => {
        const targetDiv = document.querySelector('app-item-container');
        if (!targetDiv) {
            console.log("NO DETECTED, retrying in 3 seconds...");
            setTimeout(detectTargetDiv, 3000); // Intenta nuevamente después de 3 segundos
            return;
        }

     
        const observer = new MutationObserver(function(mutationsList) {
            for(let mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    const addedNodes = mutation.addedNodes;
                    for (let i = 0; i < addedNodes.length; i++) {
                        const node = addedNodes[i];
                        if (node.nodeName === 'ITEM-CARD') {
                            const detailButtons = node.querySelector('.detail-buttons');
                            setTimeout(() => {
                                let inspectLink = detailButtons.querySelector('a[_ngcontent-ng-c2631012479]').getAttribute('href');
                                const genBtn = document.createElement('p');
                                genBtn.innerText = '!g';
                                Object.assign(genBtn.style, {
                                    background: 'white',
                                    border: '1px solid white',
                                    color: 'black',
                                    borderRadius: '50px',
                                    padding: '3px'
                                });
                                genBtn.addEventListener('click', (event) => {
                                    event.stopPropagation();
                                    makeApiRequest(inspectLink, (encryptedText) => getGen(encryptedText));
                                });
                                detailButtons.append(genBtn);
                            }, 500);
                        }
                    }
                }
            }
        });
        observer.observe(targetDiv, { childList: true, subtree: true });
    };

    detectTargetDiv();
}
 */