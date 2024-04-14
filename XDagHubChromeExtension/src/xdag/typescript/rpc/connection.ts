
interface ConnectionOptions {
  fullnode: string;
  websocket?: string;
}

export class Connection {
  #options: ConnectionOptions;

  constructor(options: ConnectionOptions) {
    this.#options = options;
  }

  get fullnode() {
    return this.#options.fullnode;
  }

  get websocket() {
    return this.#options.websocket || this.#options.fullnode;
  }

}

export const localnetConnection = new Connection({
  fullnode: "http://127.0.0.1:10001",
});

// export const devnetConnection = new Connection({
//   fullnode: "https://devnet-rpc.xdagj.org",
// });

export const testnetConnection = new Connection({
  fullnode: "https://testnet-rpc.xdagj.org",
});

export const mainnetConnection = new Connection({
  fullnode: "https://mainnet-rpc.xdagj.org",
});
