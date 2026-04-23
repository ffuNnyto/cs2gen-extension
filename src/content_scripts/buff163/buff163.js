chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

    if (message.action === 'buff163_loaded')
        buff163Ready();
    else if (message.action === 'web_url_changed')
        buff163Ready();
});

function addButtonOnClickHandler(btn, idx, dataInfo) {
    btn.onclick = async () => {
        const span = document.querySelector(`.copy-gen-${idx}`);

        if (span.id.startsWith('!g')) {
            copyToClipBoard(span.id);
            return;
        }

        const assetId = dataInfo ? JSON.parse(dataInfo)?.assetid : null;
        if (!assetId) return console.error('No assetid found');

        handleLoader(true, span);

        buffRequest(assetId, (response) => {
            const dataIndex = response.indexOf('data:');
            const inspectLink = response.substring(dataIndex + 5, response.indexOf(',', dataIndex));

            chrome.runtime.sendMessage({ action: 'fetch_skin', url: inspectLink }, ({ code, error }) => {
                if (error) return console.error('Error generating code:', error);
                span.id = code;
                copyToClipBoard(code);
                handleLoader(false, span);
            });
        });
    };
}

function createButton(idx) {
    let btn = document.createElement('span');

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
    });

    btn.innerHTML = `
        <span class="inspect_gen_gl">
            <b><i class="icon "></i></b>
            <span id="" class="copy-gen-${idx}">copy !gen</span>
        </span>
    `;

    return btn;
}

function processTableRow(node, idx) {
    if (node.nodeName === 'TR') {
        let dataInfo = node.getAttribute('data-asset-info');
        let btn = createButton(idx);

        addButtonOnClickHandler(btn, idx, dataInfo);

        let validNode = node.childNodes[5];

        if (validNode) {
            validNode.childNodes[1].childNodes[1].append(btn);
        }
    }
}

function handleLoader(status, targetId) {
    targetId.innerHTML = status ? `<div class="loader"></div>` : "copy !gen";
}

function buff163Ready() {

    console.log('[BUFF163_READY]');
    const targetDiv = document.querySelector('.detail-tab-cont');
    const observer = new MutationObserver((mutationsList, observer) => {

        if (targetDiv.innerHTML.includes('showLoading')) {
            return;
        }

        let table = document.querySelector('.list_tb');
        let tbody = table.querySelector('.list_tb_csgo');

        tbody.childNodes.forEach(processTableRow);
    });

    observer.observe(targetDiv, { childList: true });
    createToastContainer();
}