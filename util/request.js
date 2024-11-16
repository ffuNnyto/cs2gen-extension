const requestUrls = [
    'https://corsproxy.io/?https://api.cs2inspects.com/getGenCode2?url=',
    'https://buff.163.com/api/market/cs2_inspect?',
    'https://corsproxy.io/?'

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
    if (isRequestInProgress) return; // Evita llamadas duplicadas
    isRequestInProgress = true; // Marca que la petición está en progreso

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
/*async function externalRequest(url, callBack) {
    if (isRequestInProgress) return; // Evita llamadas duplicadas
    isRequestInProgress = true; // Marca que la petición está en progreso

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Invalid request ' + response.status);
        }

        const data = await response.json();
        function removeTrademarkSymbol(obj) {
            for (let key in obj) {
                if (typeof obj[key] === "string") {
                    // Reemplaza el símbolo ™ en las cadenas
                    obj[key] = obj[key].replace(/™/g, "");
                } else if (typeof obj[key] === "object" && obj[key] !== null) {
                    // Si es un objeto, aplica la función recursivamente
                    removeTrademarkSymbol(obj[key]);
                }
            }
        }
    
        // Aplica la función al JSON obtenido
        removeTrademarkSymbol(data);
    
        // Ahora `data` no tiene el símbolo ™ en ninguno de sus valores
        callBack(data)
    } catch (error) {
        console.error('Error:', error);
    } finally {
        isRequestInProgress = false; // Restablece la bandera al finalizar
    }
}*/