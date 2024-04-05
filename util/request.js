/*function makeApiRequest(inspectLink, callBack) {
    fetch(`https://corsproxy.io/?https://api.cs2inspects.com/getGenCode2?url=${inspectLink}`)
        .then(response => {

            if (!response.ok) {
                throw new Error('invalid request' + response.status);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let ciphertextHex = '';

            function processText({ done, value }) {
                if (done) {
                    callBack(ciphertextHex);
                    return;
                }
                ciphertextHex += decoder.decode(value, { stream: true }).replaceAll('"', '');
                return reader.read().then(processText);
            }

            return reader.read().then(processText);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}*/
async function makeApiRequest(inspectLink, callBack) {
    try {
        const response = await fetch(`https://corsproxy.io/?https://api.cs2inspects.com/getGenCode2?url=${inspectLink}`);

        if (!response.ok) {
            throw new Error('Invalid request ' + response.status);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let ciphertextHex = '';

        async function processText({ done, value }) {
            if (done) {
                callBack(ciphertextHex);
                return;
            }
            ciphertextHex += decoder.decode(value, { stream: true }).replaceAll('"', '');
            return processText(await reader.read());
        }

        await processText(await reader.read());
    } catch (error) {
        console.error('Error:', error);
    }
}

function buffRequest(assetId, callBack) {


    fetch(`https://buff.163.com/api/market/cs2_inspect?assetid=${assetId}&_=${+Date.now()}`)
        .then(response => {

            if (!response.ok) {
                throw new Error('invalid request' + response.status);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let responseText = '';

            function processText({ done, value }) {
                if (done) {
                    callBack(responseText);
                    return;
                }
                responseText += decoder.decode(value, { stream: true }).replaceAll('"', '');
                return reader.read().then(processText);
            }

            return reader.read().then(processText);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}