import { createLibp2p } from 'libp2p'
import { kadDHT } from '@libp2p/kad-dht'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { tcp } from '@libp2p/tcp'
import { webSockets } from '@libp2p/websockets'
import { bootstrap } from '@libp2p/bootstrap'
import { noise } from '@chainsafe/libp2p-noise'
import { mplex } from '@libp2p/mplex'
import type { Libp2p } from '@libp2p/interface'

interface PubSubMessage {
  data: Uint8Array
}

export class P2PManager {
  private node: Libp2p | undefined

  async init() {
    this.node = await createLibp2p({
      addresses: {
        listen: ['/ip4/0.0.0.0/tcp/0']
      },
      transports: [tcp(), webSockets()],
      connectionEncryption: [noise()],
      streamMuxers: [mplex()],
      services: {
        pubsub: gossipsub({
          allowPublishToZeroPeers: true
        }),
        dht: kadDHT({
          clientMode: true
        })
      },
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

  async publish(topic: string, data: unknown) {
    if (!this.node) throw new Error('P2P node not initialized')
    const pubsub = this.node.services.pubsub as any
    await pubsub.publish(topic, new TextEncoder().encode(JSON.stringify(data)))
  }

  async subscribe(topic: string, handler: (data: unknown) => void) {
    if (!this.node) throw new Error('P2P node not initialized')
    const pubsub = this.node.services.pubsub as any
    await pubsub.subscribe(topic, (message: PubSubMessage) => {
      const data = JSON.parse(new TextDecoder().decode(message.data))
      handler(data)
    })
  }

  async findPeers(topic: string) {
    if (!this.node) throw new Error('P2P node not initialized')
    const pubsub = this.node.services.pubsub as any
    const peers = await pubsub.getSubscribers(topic)
    return peers
  }

  async stop() {
    if (!this.node) throw new Error('P2P node not initialized')
    await this.node.stop()
    console.log('P2P node has stopped')
  }
} 