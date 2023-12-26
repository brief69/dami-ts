import torch
import torch.optim as optim
from models.gcn import GCN
from utils.data_loader import load_data, normalize_adjacency
import torch.nn.functional as F


# データのロード
graph_data, labels = load_data()
A, X = graph_data['adjacency'], graph_data['features']
A = normalize_adjacency(A)

# モデルとオプティマイザの定義
model = GCN(in_channels=X.size(1), hidden_channels=16, out_channels=len(set(labels)))
optimizer = optim.Adam(model.parameters(), lr=0.01)

# 学習ループ
model.train()
for epoch in range(100):
    optimizer.zero_grad()
    output = model(A, X)
    loss = F.cross_entropy(output, labels)
    loss.backward()
    optimizer.step()
    print(f"Epoch {epoch+1}, Loss: {loss.item()}")
