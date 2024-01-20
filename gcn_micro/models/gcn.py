import torch
import torch.nn as nn
import torch.nn.functional as F

class GCNLayer(nn.Module):
    def __init__(self, in_channels, out_channels):
        super(GCNLayer, self).__init__()
        self.linear = nn.Linear(in_channels, out_channels)  # 線形変換を行うレイヤーを定義

    def forward(self, A, X):
        # Aは正規化された隣接行列, Xはノード特徴
        # 隣接行列とノード特徴を掛け合わせた後、線形変換を行う
        return self.linear(torch.matmul(A, X))

class GCN(nn.Module):
    def __init__(self, in_channels, hidden_channels, out_channels):
        super(GCN, self).__init__()
        self.gcn1 = GCNLayer(in_channels, hidden_channels)  # 第一層のGCNレイヤーを定義
        self.gcn2 = GCNLayer(hidden_channels, out_channels)  # 第二層のGCNレイヤーを定義

    def forward(self, A, X):
        # 第一層のGCNレイヤーを通過させ、ReLU活性化関数を適用
        X = F.relu(self.gcn1(A, X))
        # 第二層のGCNレイヤーを通過させる
        return self.gcn2(A, X)
