const requestUrls = [
    'https://corsproxy.io/?https://api.cs2inspects.com/getGenCode2?url=',
    'https://buff.163.com/api/market/cs2_inspect?'

]

async function makeApiRequest(r, inspectLink, callBack) {
    try {
        //const response = await fetch(`https://corsproxy.io/?https://api.cs2inspects.com/getGenCode2?url=${inspectLink}`);
        const response = await fetch(r == true ? requestUrls[0] + inspectLink : requestUrls[1] + `assetid=${inspectLink}&_=1`);
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

async function buffRequest(assetId, callBack) {
    return makeApiRequest(false, assetId, callBack);
}
