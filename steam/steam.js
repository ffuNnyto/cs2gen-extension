function steamLoaded() {
    const targetDiv = document.querySelector('.inventory_page_right');

    targetDiv.addEventListener('DOMNodeInserted', function (event) {

        if (event.target && event.target.nodeName === 'A') {

            if (event.target.classList[1] === 'btn_grey_white_innerfade') {

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
                    whiteSpace: 'nowrap',
                })

                buttonGen.onclick = () => {
                    let inspectLink = event.target.getAttribute('href')
                    makeApiRequest(inspectLink, (encryptedText) => getGen(encryptedText));
                }

                buttonGen.innerHTML = `
                    <div>
                        <span>Copy !Gen</span>
                    </div>
                `
                event.target.parentNode.appendChild(buttonGen)
            }
        }
    })
}


steamLoaded();