function loadBitSkins() {

    console.log('[BITSKINS_READY]')
    
    const targetDiv = document.querySelector('body')

    targetDiv.addEventListener('DOMNodeInserted', function (event) {


        if (event.target.className === 'market-items') {

            let children = event.target.childNodes

            children.forEach((node) => {

                let btn = node.childNodes[1]

                if (!btn)
                    return


                let optionButton = btn.childNodes[0].childNodes[4]

                optionButton.addEventListener('click', () => {

                    let itemLinks = document.querySelector('.item-links')
                    let genButton = document.createElement('div')


                    genButton.onclick = () =>
                        makeApiRequest(inspectLink, (encryptedText) => getGen(encryptedText));

                    genButton.innerHTML = `
                        <span class="flex-row" rel="nofollow noopener noreferrer" target="_blank">
                            <img src="/assets/external-link-daf0fe40.svg" class="mr-15" alt="icon">
                            <span>Copy !gen</span>
                        </span>
                    `
                    itemLinks.appendChild(genButton)
                    let inspectLink = itemLinks.childNodes[4].getAttribute('href')

                })
            })
        }
    });



}


loadBitSkins();