export function base64ToUtf8(base64String: string): string | null {
  try {
    // Decode base64 to a byte array (Uint8Array)
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    // Decode the byte array as UTF-8
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(byteArray);
  } catch (e) {
    console.error("Error decoding base64 with TextDecoder:", e);
    return null;
  }
}
