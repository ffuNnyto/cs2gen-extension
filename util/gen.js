async function getGen(ciphertextHex) {

    console.log('skin readed');
    const secretKey = 'cs2inspects.com-is-awesome112023';
    const iv = 'cs2inspects--com';

    let data = await decryptText(ciphertextHex, secretKey, iv);

    return JSON.parse(data).genCode;

}

function copyToClipBoard(txt) {

    throwToast(`!gen copy to clipboard`);
    navigator.clipboard.writeText(String(txt));
}