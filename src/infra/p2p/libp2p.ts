import { createLibp2p } from 'libp2p'
import { kadDHT } from '@libp2p/kad-dht'
import { pubsub } from '@libp2p/pubsub'
import { tcp } from '@libp2p/tcp'
import { webSockets } from '@libp2p/websockets'
import { bootstrap } from '@libp2p/bootstrap'
import { noise } from '@chainsafe/libp2p-noise'
import { mplex } from '@libp2p/mplex'

export class P2PManager {
  private node: any

  async init() {
    this.node = await createLibp2p({
      addresses: {
        listen: ['/ip4/0.0.0.0/tcp/0']
      },
      transports: [tcp(), webSockets()],
      connectionEncryption: [noise()],
      streamMuxers: [mplex()],
      dht: kadDHT(),
      pubsub: pubsub(),
      peerDiscovery: [
        bootstrap({
          list: [
            // ブートストラップノードのリストを追加
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN'
          ]
        })
      ]
    })

    await this.node.start()
    console.log('P2P node has started')
  }

  async publish(topic: string, data: any) {
    await this.node.pubsub.publish(topic, new TextEncoder().encode(JSON.stringify(data)))
  }

  async subscribe(topic: string, handler: (data: any) => void) {
    await this.node.pubsub.subscribe(topic, (message: any) => {
      const data = JSON.parse(new TextDecoder().decode(message.data))
      handler(data)
    })
  }

  async findPeers(topic: string) {
    const peers = await this.node.pubsub.getSubscribers(topic)
    return peers
  }

  async stop() {
    await this.node.stop()
    console.log('P2P node has stopped')
  }
} 