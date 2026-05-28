// Polyfills — exact pattern from official Solana Mobile docs for Expo SDK 49+ + Expo Router
// https://docs.solanamobile.com/react-native/expo

import { getRandomValues as expoCryptoGetRandomValues } from "expo-crypto";
import { Buffer } from "buffer";

// Buffer polyfill — needed by @solana/web3.js
global.Buffer = Buffer;

// crypto.getRandomValues polyfill — needed by @solana/web3.js key generation
class Crypto {
  getRandomValues = expoCryptoGetRandomValues;
}

const webCrypto = typeof crypto !== "undefined" ? crypto : new Crypto();

(() => {
  if (typeof crypto === "undefined") {
    Object.defineProperty(window, "crypto", {
      configurable: true,
      enumerable: true,
      get: () => webCrypto,
    });
  }
})();

// Expo Router entry — must come after polyfills
import "expo-router/entry";
