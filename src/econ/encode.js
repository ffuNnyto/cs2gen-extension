import { getChecksum } from "./inspect-payload.js";

const previewLink = "steam://run/730//+csgo_econ_action_preview";

function floatToUint32(f) {
    const buf = new ArrayBuffer(4);
    new Float32Array(buf)[0] = f;
    return new DataView(buf).getUint32(0, true);
}

function writeFloat32(f, out) {
    const buf = new ArrayBuffer(4);
    const dv = new DataView(buf);
    dv.setFloat32(0, f, true);

    out.push(
        dv.getUint8(0),
        dv.getUint8(1),
        dv.getUint8(2),
        dv.getUint8(3)
    );
}

function writeString(str, out) {
    const enc = new TextEncoder().encode(str);
    writeVarint(enc.length, out);
    out.push(...enc);
}

function writeVarint(n, out) {
    let v = BigInt(n);
    while (v >= 0x80n) {
        out.push(Number((v & 0x7Fn) | 0x80n));
        v >>= 7n;
    }
    out.push(Number(v));
}

function tag(field, wire, out) {
    writeVarint((field << 3) | wire, out);
}

function uint32BE(n) {
    const b = new Uint8Array(4);
    new DataView(b.buffer).setUint32(0, n, false);
    return b;
}

function encodeSticker(sticker) {

    const s = [];

    if (sticker.slot !== undefined) {
        tag(1, 0, s);
        writeVarint(sticker.slot, s);
    }

    if (sticker.sticker_id !== undefined) {
        tag(2, 0, s);
        writeVarint(sticker.sticker_id, s);
    }

    if (sticker.wear !== undefined) {
        tag(3, 5, s);
        writeFloat32(sticker.wear, s);
    }

    if (sticker.scale !== undefined) {
        tag(4, 5, s);
        writeFloat32(sticker.scale, s);
    }

    if (sticker.rotation !== undefined) {
        tag(5, 5, s);
        writeFloat32(sticker.rotation, s);
    }

    if (sticker.tint_id !== undefined) {
        tag(6, 0, s);
        writeVarint(sticker.tint_id, s);
    }

    if (sticker.offset_x !== undefined) {
        tag(7, 5, s);
        writeFloat32(sticker.offset_x, s);
    }

    if (sticker.offset_y !== undefined) {
        tag(8, 5, s);
        writeFloat32(sticker.offset_y, s);
    }

    if (sticker.offset_z !== undefined) {
        tag(9, 5, s);
        writeFloat32(sticker.offset_z, s);
    }

    if (sticker.pattern !== undefined) {
        tag(10, 0, s);
        writeVarint(sticker.pattern, s);
    }

    if (sticker.highlight_reel !== undefined) {
        tag(11, 0, s);
        writeVarint(sticker.highlight_reel, s);
    }

    if (sticker.wrapped_sticker !== undefined) {
        tag(12, 0, s);
        writeVarint(sticker.wrapped_sticker, s);
    }

    return s;
}

export function generateHex(econ) {

    const out = [];

    if (econ.accountid !== undefined) {
        tag(1, 0, out);
        writeVarint(econ.accountid, out);
    }

    if (econ.itemid !== undefined) {
        tag(2, 0, out);
        writeVarint(econ.itemid, out);
    }

    if (econ.defindex !== undefined) {
        tag(3, 0, out);
        writeVarint(econ.defindex, out);
    }

    if (econ.paintindex !== undefined) {
        tag(4, 0, out);
        writeVarint(econ.paintindex, out);
    }

    if (econ.rarity !== undefined) {
        tag(5, 0, out);
        writeVarint(econ.rarity, out);
    }

    if (econ.quality !== undefined) {
        tag(6, 0, out);
        writeVarint(econ.quality, out);
    }

    if (econ.paintwear !== undefined) {
        tag(7, 0, out);
        writeVarint(floatToUint32(econ.paintwear), out);
    }

    if (econ.paintseed !== undefined) {
        tag(8, 0, out);
        writeVarint(econ.paintseed, out);
    }

    if (econ.killeaterscoretype !== undefined) {
        tag(9, 0, out);
        writeVarint(econ.killeaterscoretype, out);
    }

    if (econ.killeatervalue !== undefined) {
        tag(10, 0, out);
        writeVarint(econ.killeatervalue, out);
    }

    if (econ.customname !== undefined) {
        tag(11, 2, out);
        writeString(econ.customname, out);
    }

    if (econ.stickers) {

        for (const sticker of econ.stickers) {

            const stickerBytes = encodeSticker(sticker);

            tag(12, 2, out);
            writeVarint(stickerBytes.length, out);
            out.push(...stickerBytes);

        }

    }

    if (econ.inventory !== undefined) {
        tag(13, 0, out);
        writeVarint(econ.inventory, out);
    }

    if (econ.origin !== undefined) {
        tag(14, 0, out);
        writeVarint(econ.origin, out);
    }

    if (econ.questid !== undefined) {
        tag(15, 0, out);
        writeVarint(econ.questid, out);
    }

    if (econ.dropreason !== undefined) {
        tag(16, 0, out);
        writeVarint(econ.dropreason, out);
    }

    if (econ.musicindex !== undefined) {
        tag(17, 0, out);
        writeVarint(econ.musicindex, out);
    }

    if (econ.entindex !== undefined) {
        tag(18, 0, out);
        writeVarint(econ.entindex, out);
    }

    if (econ.petindex !== undefined) {
        tag(19, 0, out);
        writeVarint(econ.petindex, out);
    }

    if (econ.keychains) {

        for (const keychain of econ.keychains) {

            const keychainBytes = encodeSticker(keychain);

            tag(20, 2, out);
            writeVarint(keychainBytes.length, out);
            out.push(...keychainBytes);

        }

    }

    const payload = new Uint8Array(out);

    const checksum = uint32BE(getChecksum(payload));

    const full = new Uint8Array(1 + payload.length + 4);
    full[0] = 0;
    full.set(payload, 1);
    full.set(checksum, 1 + payload.length);

    return Array.from(full)
        .map(x => x.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();
}

export function generateLink(econ) {
    return `${previewLink} ${generateHex(econ)}`;
}
