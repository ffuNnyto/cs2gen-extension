chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

    if (message.action === 'buff163_loaded') {
        console.log('[BUFF163_READY]')
        buff163Ready();
    }
    else if (message.action === 'web_url_changed') {
        buff163Ready();
    }

});



function buff163Ready() {

    const targetDiv = document.querySelector('.detail-tab-cont')

    if (!targetDiv) {

        console.log("NO DETECTED")
        return;
    }

    targetDiv.addEventListener('DOMNodeInserted', function (event) {

        if (event.target && event.target.nodeName === 'TABLE') {

            let table = event.target;
            let tbody = table.childNodes[1]

            tbody.childNodes.forEach((node, idx) => {
                if (node.nodeName === 'TR') {

                    let dataInfo = node.getAttribute('data-asset-info');


                    let btn = document.createElement('span')

                    btn.onclick = async () => {
                        buffRequest(JSON.parse(dataInfo).assetid, async (response) => {
                            
                            let dataIndex = response.indexOf('data:');
                            let commaIndex = response.indexOf(',', dataIndex);
                            let inspectLink = response.substring(dataIndex + 6, commaIndex);

                            await makeApiRequest(inspectLink, (encryptedText) => getGen(encryptedText));
                        });
                    };

                    Object.assign(btn.style, {
                        cursor: 'pointer',
                        display: 'inline-block',
                        border: ' 1px solid #e6e6e6',
                        color: '#959595',
                        borderRadius: '12px',
                        fontSize: ' 12px',
                        padding: '2px 6px',
                        lineHeight: '18px',
                        maxWidth: '120px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    })

                    btn.innerHTML = `
                    <span class="inspect_gen_gl">
                        <b><i class="icon icon_game"></i></b>
                        copy !gen
                    </span>
                    `


                    let validNode = node.childNodes[5]

                    if (!validNode)
                        return

                    validNode.childNodes[1].childNodes[1].append(btn)


                }
            });
        }
    })

}
