interface Window {
  ethereum?: {
    isMetaMask?: true
    on?: (...args: any[]) => void
    removeListener?: (...args: any[]) => void
    autoRefreshOnNetworkChange?: boolean
  }
  web3?: Record<string, unknown>
}

declare module '@pinata/ipfs-gateway-tools/dist/node' {
  export default class IPFSGatewayTools {
    constructor()

    containsCID(url: string): { containsCid: boolean; cid: string | null }
    convertToDesiredGateway(
      sourceUrl: string,
      desiredGatewayPrefix: string,
    ): string
  }
}

type URI = string
type UUID = string
