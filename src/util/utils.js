function copyToClipBoard(txt) {
    const text = String(txt);

    navigator.clipboard.writeText(text).then(
        () => throwToast('Paste it in the CS2 console to use it.', 'success', text),
        () => throwToast('Could not access the clipboard.', 'error')
    );
}
