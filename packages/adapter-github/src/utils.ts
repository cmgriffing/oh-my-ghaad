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

export function utf8ToBase64(utf8String: string): string | null {
  try {
    // Encode the string as UTF-8
    const encoder = new TextEncoder();
    const byteArray = encoder.encode(utf8String);

    // Convert the byte array to base64 and return it
    return btoa(String.fromCharCode(...byteArray));
  } catch (e) {
    console.error("Error encoding string as base64:", e);
    return null;
  }
}
