import torch
import torch.nn as nn
import torch.nn.functional as F

class GCNLayer(nn.Module):
    def __init__(self, in_channels, out_channels):
        super(GCNLayer, self).__init__()
        self.linear = nn.Linear(in_channels, out_channels)

    def forward(self, A, X):
        # Aは正規化された隣接行列, Xはノード特徴
        return self.linear(torch.matmul(A, X))

class GCN(nn.Module):
    def __init__(self, in_channels, hidden_channels, out_channels):
        super(GCN, self).__init__()
        self.gcn1 = GCNLayer(in_channels, hidden_channels)
        self.gcn2 = GCNLayer(hidden_channels, out_channels)

    def forward(self, A, X):
        X = F.relu(self.gcn1(A, X))
        return self.gcn2(A, X)
