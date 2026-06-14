// Teaven Email - UUID helpers

const byteToHex = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, '0'));

export function uuidv7(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  const timestamp = Date.now();
  bytes[0] = Math.floor(timestamp / 2 ** 40) % 256;
  bytes[1] = Math.floor(timestamp / 2 ** 32) % 256;
  bytes[2] = Math.floor(timestamp / 2 ** 24) % 256;
  bytes[3] = Math.floor(timestamp / 2 ** 16) % 256;
  bytes[4] = Math.floor(timestamp / 2 ** 8) % 256;
  bytes[5] = timestamp % 256;

  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return byteToHex[bytes[0]] + byteToHex[bytes[1]] + byteToHex[bytes[2]] + byteToHex[bytes[3]] +
    '-' + byteToHex[bytes[4]] + byteToHex[bytes[5]] +
    '-' + byteToHex[bytes[6]] + byteToHex[bytes[7]] +
    '-' + byteToHex[bytes[8]] + byteToHex[bytes[9]] +
    '-' + byteToHex[bytes[10]] + byteToHex[bytes[11]] + byteToHex[bytes[12]] + byteToHex[bytes[13]] + byteToHex[bytes[14]] + byteToHex[bytes[15]];
}
