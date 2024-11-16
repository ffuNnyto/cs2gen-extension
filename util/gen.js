async function getGen(ciphertextHex) {

    console.log('skin readed');
    const secretKey = 'cs2inspects.com-is-awesome112023';
    const iv = 'cs2inspects--com';

    let data = await decryptText(ciphertextHex, secretKey, iv);

    return JSON.parse(data).genCode;

    /*await decryptText(ciphertextHex, secretKey, iv)
        .then(plaintext => {
            
           let data=JSON.parse(plaintext)

          
           console.log(data.genCode)

           return data.genCode;

        })
        .catch(error => {
            console.error('Error while decrypting text:', error);
            throw new Error('Failed to get generation code');
        });*/

}

function copyToClipBoard(txt) {
    navigator.clipboard.writeText(String(txt));
}