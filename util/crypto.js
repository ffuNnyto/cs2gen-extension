async function decryptText(ciphertextHex, secretKey, iv) {

    const ciphertext = hexStringToUint8Array(ciphertextHex);

    const secretKeyBuffer = await window.crypto.subtle.importKey(
        'raw',
        encodeText(secretKey),
        {
            name: 'AES-CBC',
            length: 256
        },
        false,
        ['decrypt']
    );

    const plaintextBuffer = await window.crypto.subtle.decrypt(
        {
            name: 'AES-CBC',
            iv: encodeText(iv)
        },
        secretKeyBuffer,
        ciphertext
    );

    const plaintext = new TextDecoder().decode(plaintextBuffer);

    return plaintext;
}

function hexStringToUint8Array(hexString) {
    return new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}

function encodeText(text) {
    return new TextEncoder().encode(text);
}
