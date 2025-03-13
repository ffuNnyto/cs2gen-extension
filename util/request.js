const requestUrls = [
    'https://corsproxy.io/?url=https://api.cs2inspects.com/getGenCode2?url=',
    'https://buff.163.com/api/market/cs2_inspect?',
    'https://corsproxy.io/?'

]

async function makeApiRequest(r, inspectLink, callBack) {
    try {
       
        const response = await fetch(r == true ? requestUrls[0] + inspectLink : requestUrls[1] + `assetid=${inspectLink}&_=1`);
        if (!response.ok) {
            throwToast("Error at creating GEN CODE");
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


async function externalRequest2(url, callBack) {
   

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Invalid request ' + response.status);
        }
        const data = await response.json();
       
        callBack(data)
    } catch (error) {
        console.error('Error:', error);
    } finally {
      
    }
}



let isRequestInProgress = false;
async function externalRequest(url, callBack) {
    if (isRequestInProgress) return;
    isRequestInProgress = true;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            
            throw new Error('Invalid request ' + response.status);
        }
        const data = await response.json();
       
        callBack(data)
    } catch (error) {
       
        console.error('Error:', error);
    } finally {
        isRequestInProgress = false; // Restablece la bandera al finalizar
    }
}
