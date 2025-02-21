import { create as createIpfsClient } from 'kubo-rpc-client';
import { createLibp2p } from 'libp2p';
import { noise } from '@chainsafe/libp2p-noise';
import { mplex } from '@libp2p/mplex';
import { tcp } from '@libp2p/tcp';
import { gossipsub } from '@chainsafe/libp2p-gossipsub';

async function main() {
    console.log('DAMIプロトコル初期化中...');

    try {
        // IPFSクライアントの初期化
        const ipfs = createIpfsClient({ host: 'localhost', port: 5001, protocol: 'http' });
        console.log('IPFS接続完了');

        // libp2pノードの設定
        const node = await createLibp2p({
            addresses: {
                listen: ['/ip4/0.0.0.0/tcp/0']
            },
            transports: [tcp()],
            connectionEncryption: [noise()],
            streamMuxers: [mplex()],
            services: {
                pubsub: gossipsub()
            }
        });

        await node.start();
        console.log('P2Pノード起動完了');
        console.log('リッスンアドレス:', node.getMultiaddrs());

        // 基本的な接続テスト
        const testData = { message: 'DAMI Protocol Test' };
        const result = await ipfs.add(JSON.stringify(testData));
        console.log('テストデータをIPFSに保存:', result.path);

        // 保存したデータの取得テスト
        const chunks = [];
        for await (const chunk of ipfs.cat(result.path)) {
            chunks.push(chunk);
        }
        const retrievedData = Buffer.concat(chunks).toString();
        console.log('IPFSから取得したデータ:', retrievedData);

    } catch (error) {
        console.error('エラーが発生しました:', error);
    } finally {
        // クリーンアップ
        try {
            await node.stop();
            console.log('P2Pノードを停止しました');
        } catch (error) {
            console.error('ノードの停止中にエラーが発生しました:', error);
        }
    }
}

main().catch(console.error); 