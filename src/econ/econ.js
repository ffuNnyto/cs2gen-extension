// econ.js
import { MessageType } from "@protobuf-ts/runtime";

/**
 * CEconItemPreviewDataBlock
 */
class CEconItemPreviewDataBlock$Type extends MessageType {
    constructor() {
        super("CEconItemPreviewDataBlock", [
            { no: 1, name: "accountid", kind: "scalar", opt: true, T: 13 },
            { no: 2, name: "itemid", kind: "scalar", opt: true, T: 4, L: 0 },
            { no: 3, name: "defindex", kind: "scalar", opt: true, T: 13 },
            { no: 4, name: "paintindex", kind: "scalar", opt: true, T: 13 },
            { no: 5, name: "rarity", kind: "scalar", opt: true, T: 13 },
            { no: 6, name: "quality", kind: "scalar", opt: true, T: 13 },
            { no: 7, name: "paintwear", kind: "scalar", opt: true, T: 13 },
            { no: 8, name: "paintseed", kind: "scalar", opt: true, T: 13 },
            { no: 9, name: "killeaterscoretype", kind: "scalar", opt: true, T: 13 },
            { no: 10, name: "killeatervalue", kind: "scalar", opt: true, T: 13 },
            { no: 11, name: "customname", kind: "scalar", opt: true, T: 9 },
            { no: 12, name: "stickers", kind: "message", repeat: 2, T: () => CEconItemPreviewDataBlock_Sticker },
            { no: 13, name: "inventory", kind: "scalar", opt: true, T: 13 },
            { no: 14, name: "origin", kind: "scalar", opt: true, T: 13 },
            { no: 15, name: "questid", kind: "scalar", opt: true, T: 13 },
            { no: 16, name: "dropreason", kind: "scalar", opt: true, T: 13 },
            { no: 17, name: "musicindex", kind: "scalar", opt: true, T: 13 },
            { no: 18, name: "entindex", kind: "scalar", opt: true, T: 5 },
            { no: 19, name: "petindex", kind: "scalar", opt: true, T: 13 },
            { no: 20, name: "keychains", kind: "message", repeat: 2, T: () => CEconItemPreviewDataBlock_Sticker }
        ]);
    }
}
export const CEconItemPreviewDataBlock = new CEconItemPreviewDataBlock$Type();

/**
 * CEconItemPreviewDataBlock.Sticker
 */
class CEconItemPreviewDataBlock_Sticker$Type extends MessageType {
    constructor() {
        super("CEconItemPreviewDataBlock.Sticker", [
            { no: 1, name: "slot", kind: "scalar", opt: true, T: 13 },
            { no: 2, name: "sticker_id", kind: "scalar", opt: true, T: 13 },
            { no: 3, name: "wear", kind: "scalar", opt: true, T: 2 },
            { no: 4, name: "scale", kind: "scalar", opt: true, T: 2 },
            { no: 5, name: "rotation", kind: "scalar", opt: true, T: 2 },
            { no: 6, name: "tint_id", kind: "scalar", opt: true, T: 13 },
            { no: 7, name: "offset_x", kind: "scalar", opt: true, T: 2 },
            { no: 8, name: "offset_y", kind: "scalar", opt: true, T: 2 },
            { no: 9, name: "offset_z", kind: "scalar", opt: true, T: 2 },
            { no: 10, name: "pattern", kind: "scalar", opt: true, T: 13 },
            { no: 11, name: "highlight_reel", kind: "scalar", opt: true, T: 13 },
            { no: 12, name: "wrapped_sticker", kind: "scalar", opt: true, T: 13 }
        ]);
    }
}
export const CEconItemPreviewDataBlock_Sticker = new CEconItemPreviewDataBlock_Sticker$Type();