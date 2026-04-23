import { CEconItemPreviewDataBlock } from "./econ.js";
import { bytesToFloat, getChecksum } from "./inspect-payload.js";


export const normalizeDecodedEcon = (econ) => ({
    ...econ,
    paintwear: econ.paintwear === undefined ? undefined : bytesToFloat(econ.paintwear),
});


const hasDecodedInspectPayload = (econ) => (
    econ.itemid !== undefined ||
    econ.defindex !== undefined ||
    econ.paintindex !== undefined ||
    econ.paintseed !== undefined ||
    (econ.stickers && econ.stickers.length > 0) ||
    (econ.keychains && econ.keychains.length > 0)
);


const assertValidHex = (hex) => {
    if (!/^[0-9A-F]+$/i.test(hex) || hex.length % 2 !== 0) {
        throw new Error("Invalid inspect hex payload");
    }
};


const decodeURIComponentSafely = (value) => {
    try { return decodeURIComponent(value); } 
    catch { return value; }
};


const extractHexFromLink = (link) => {
    const decoded = decodeURIComponentSafely(link.trim());
    const match = decoded.match(
        /^(?:steam:\/\/(?:run|rungame)\/730\/(?:[a-z]{2}\/)?(?:76561202255233023\/)?\/?)?\+?csgo_econ_action_preview\s+([0-9A-F]+)$/i
    );
    if (match?.[1]) { assertValidHex(match[1]); return match[1]; }
    throw new Error("Invalid inspect link");
};

const decodePayload = (payload, isValidPayload) => {
    const econ = normalizeDecodedEcon(CEconItemPreviewDataBlock.fromBinary(payload));
    if (!isValidPayload(econ)) throw new Error("Invalid inspect hex payload");
    return econ;
};


const readUint32BE = (buffer, offset) => {
    const view = new DataView(buffer.buffer, buffer.byteOffset + offset, 4);
    return view.getUint32(0, false);
};


const decodeWrappedBuffer = (buffer) => {
    if (buffer.length < 5 || buffer[0] !== 0) throw new Error("Invalid inspect hex payload");
    const payload = buffer.subarray(1, -4);
    const expectedChecksum = readUint32BE(buffer, buffer.length - 4);
    const actualChecksum = getChecksum(payload);
    if (expectedChecksum !== actualChecksum) throw new Error("Checksum mismatch");
    return decodePayload(payload, hasDecodedInspectPayload);
};


const xorMaskBuffer = (buffer, key) => buffer.map(b => b ^ key);


const isDecodedMaskedInspectPayload = (econ) => (
    econ.itemid !== undefined &&
    econ.defindex !== undefined &&
    econ.paintindex !== undefined &&
    econ.inventory !== undefined &&
    econ.origin !== undefined
);


const decodeMaskedBuffer = (buffer) => {
    if (buffer.length < 5) throw new Error("Invalid inspect hex payload");
    const unmasked = xorMaskBuffer(buffer, buffer[0]);
    if (unmasked[0] !== 0) throw new Error("Invalid inspect hex payload");
    return decodePayload(unmasked.subarray(1, -4), isDecodedMaskedInspectPayload);
};


export const decodeHex = (hex) => {
    const normalized = hex.trim();
    assertValidHex(normalized);
    const buffer = new Uint8Array(normalized.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    return buffer[0] === 0 ? decodeWrappedBuffer(buffer) : decodeMaskedBuffer(buffer);
};


export const decodeLink = (link) => decodeHex(extractHexFromLink(link));

