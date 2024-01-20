import torch
from torch_geometric.nn import GCNConv

class GCN(torch.nn.Module):
    # GCN (Graph Convolutional Network) モデルの定義
    def __init__(self, in_channels, hidden_channels, out_channels):
        super(GCN, self).__init__()
        # 第一層の畳み込み層
        self.conv1 = GCNConv(in_channels, hidden_channels)
        # 第二層の畳み込み層
        self.conv2 = GCNConv(hidden_channels, out_channels)

    def forward(self, x, edge_index):
        # 第一層の畳み込みとReLU活性化関数
        x = self.conv1(x, edge_index).relu()
        # 第二層の畳み込み
        x = self.conv2(x, edge_index)
        # 結果を返す
        return x