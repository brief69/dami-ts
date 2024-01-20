import pickle
import torch
import scipy.sparse as sp
import numpy as np


def load_data():
    # 'GCN_Project/data/graph_data.pkl'からグラフデータをロードする
    with open('GCN_Project/data/graph_data.pkl', 'rb') as f:
        graph_data = pickle.load(f)
    
    # 'GCN_Project/data/labels.pkl'からラベルデータをロードする
    with open('GCN_Project/data/labels.pkl', 'rb') as f:
        labels = pickle.load(f)
    
    # ロードしたグラフデータとラベルデータを返す
    return graph_data, labels

def normalize_adjacency(adjacency):
    # 隣接行列を正規化する
    # 隣接行列に単位行列を加える
    adjacency += sp.eye(adjacency.shape[0])
    # 隣接行列の各行の和の逆数の平方根を対角成分とする対角行列を作成
    degree_mat_inv_sqrt = sp.diags(np.power(np.array(adjacency.sum(1)), -0.5).flatten())
    # 正規化した隣接行列を作成
    normalized_adj = adjacency.dot(degree_mat_inv_sqrt).transpose().dot(degree_mat_inv_sqrt).tocoo()
    # 正規化した隣接行列をスパーステンソルに変換
    normalized_adj = torch.FloatTensor(normalized_adj.data, device='cpu').to_sparse()
    # 正規化した隣接行列を返す
    return normalized_adj
