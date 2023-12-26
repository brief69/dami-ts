import torch
from models.gcn import GCN
from utils.data_loader import load_data, normalize_adjacency

def evaluate(model, adjacency, features, labels):
    model.eval()
    with torch.no_grad():
        predictions = model(adjacency, features)
    _, predicted = predictions.max(1)
    correct = predicted.eq(labels).sum().item()
    return correct / labels.size(0)  # accuracy

# データのロード
graph_data, labels = load_data()
A, X = graph_data['adjacency'], graph_data['features']
A = normalize_adjacency(A)

# 事前に学習したモデルのロード (例: 'model.pth'という名前で保存されたモデルを使用する場合)
model_path = "model.pth"
model = GCN(in_channels=X.size(1), hidden_channels=16, out_channels=len(set(labels)))
model.load_state_dict(torch.load(model_path))
model.eval()

# モデルの評価
accuracy = evaluate(model, A, X, labels)
print(f"Accuracy: {accuracy * 100:.2f}%")
