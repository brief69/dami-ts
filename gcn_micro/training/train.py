from pkg_resources import evaluate_marker
import torch
import torch.nn.functional as F
from torch_geometric.datasets import Planetoid
from models.gcn_model import GCN

# データセットの読み込み
dataset = Planetoid(root='/tmp/Cora', name='Cora')  # Coraデータセットを読み込む
model = GCN(dataset.num_features, 16, dataset.num_classes)  # GCNモデルの初期化
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)  # オプティマイザの設定

data = dataset[0]  # データセットからデータを取得

# 訓練ループ
for epoch in range(200):  # 200エポックで訓練
    model.train()  # モデルを訓練モードに設定
    optimizer.zero_grad()  # 勾配をゼロに初期化
    out = model(data.x, data.edge_index)  # モデルの順伝播
    loss = F.cross_entropy(out[data.train_mask], data.y[data.train_mask])  # 損失の計算
    loss.backward()  # 勾配の計算
    optimizer.step()  # パラメータの更新

# 評価関数の定義
def evaluate(model, data):  # モデルの評価関数
    model.eval()  # モデルを評価モードに設定
    with torch.no_grad():  # 勾配の計算を停止
        logits = model(data.x, data.edge_index)  # モデルの順伝播
        pred = logits.argmax(dim=1)  # 最大値のインデックスを予測とする
        correct = (pred[data.test_mask] == data.y[data.test_mask]).sum()  # 正解数の計算
        acc = int(correct) / int(data.test_mask.sum())  # 正解率の計算
    return acc  # 正解率を返す

# 訓練後のモデルの性能を評価
acc = evaluate_marker(model, data)  # モデルの評価
print(f'Test Accuracy: {acc}')  # テスト精度の表示
torch.save(model.state_dict(), 'model.pth')  # モデルの保存
