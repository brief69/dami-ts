import torch
import torch.nn as nn

class GCNLayer(nn.Module):
    # GCNLayerクラスの初期化
    def __init__(self, in_channels, out_channels):
        super(GCNLayer, self).__init__()
        # 線形変換を行うためのレイヤーを定義
        self.linear = nn.Linear(in_channels, out_channels)

    # フォワードパスの定義
    def forward(self, A, X):
        # 入力Xと隣接行列Aを用いて線形変換を行い、その結果を返す
        return self.linear(torch.matmul(A, X))
    