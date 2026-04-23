export const floatToBytes = (floatValue) => {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setFloat32(0, floatValue, true);
    return view.getUint32(0, true);
};

export const bytesToFloat = (uintValue) => {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setUint32(0, uintValue, true);
    return view.getFloat32(0, true);
};


const makeCRC32Table = () => {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) {
            c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        }
        table[i] = c;
    }
    return table;
};

const CRC32_TABLE = makeCRC32Table();

const crc32buf = (data) => {
    let crc = -1;
    for (let i = 0; i < data.length; i++) {
        crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ data[i]) & 0xFF];
    }
    return (crc ^ -1) | 0;
};

export const getChecksum = (payload) => {
    const bufferPayload = new Uint8Array(1 + payload.length);
    bufferPayload[0] = 0;
    bufferPayload.set(payload, 1);
    const crc = crc32buf(bufferPayload);
    const x_crc = (crc & 0xffff) ^ (payload.length * crc);
    return (x_crc & 0xffffffff) >>> 0;
};