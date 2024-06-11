
import { webcrypto } from "crypto";

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as Crypto;
}

globalThis.chrome = {
  runtime: {
    id: "some-test-id-from-test-setup",
  },
};
