function copyToClipBoard(txt) {

    throwToast(`!gen copy to clipboard,paste it in game console`);
    navigator.clipboard.writeText(String(txt));
}