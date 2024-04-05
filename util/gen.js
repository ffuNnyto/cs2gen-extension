function getGen(ciphertextHex) {

    console.log('skin readed');
    const secretKey = 'cs2inspects.com-is-awesome112023';
    const iv = 'cs2inspects--com';

    decryptText(ciphertextHex, secretKey, iv)
        .then(plaintext => {
            
            let skin_data = JSON.parse(plaintext)
            navigator.clipboard.writeText(String(skin_data.genCode));

        })
        .catch(error => {
            console.error('error at decrypt text', error);
        });

}