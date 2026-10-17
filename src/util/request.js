async function buffRequest(assetId, callBack) {
    try {
        const response = await fetch(`https://buff.163.com/api/market/cs2_inspect?assetid=${assetId}&_=1`);
        if (!response.ok) {
            throwToast("Could not generate the !gen code.", "error");
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