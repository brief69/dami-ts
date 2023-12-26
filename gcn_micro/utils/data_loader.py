import pickle
import torch
import scipy.sparse as sp
import numpy as np


def load_data():
    with open('GCN_Project/data/graph_data.pkl', 'rb') as f:
        graph_data = pickle.load(f)
    
    with open('GCN_Project/data/labels.pkl', 'rb') as f:
        labels = pickle.load(f)
    
    return graph_data, labels

def normalize_adjacency(adjacency):
    # 隣接行列の正規化
    adjacency += sp.eye(adjacency.shape[0])
    degree_mat_inv_sqrt = sp.diags(np.power(np.array(adjacency.sum(1)), -0.5).flatten())
    normalized_adj = adjacency.dot(degree_mat_inv_sqrt).transpose().dot(degree_mat_inv_sqrt).tocoo()
    normalized_adj = torch.FloatTensor(normalized_adj.data, device='cpu').to_sparse()
    return normalized_adj
