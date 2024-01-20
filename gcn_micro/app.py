from flask import Flask, request, jsonify  # Flaskとその他の必要なライブラリをインポート
import torch  # PyTorchをインポート
from models.gcn_model import GCN  # GCNモデルをインポート
from training.train import dataset  # データセットをインポート

app = Flask(__name__)  # Flaskアプリケーションを作成

# 仮のGCNモデル予測関数（後で実際のモデルに置き換える）
def predict_gcn(data):
    # ここでデータをモデルに渡して予測を行い、結果を返す
    # 今はダミーの予測結果を返す
    return {"prediction": "dummy_result"}  # ダミーの予測結果を返す

@app.route('/predict', methods=['POST'])  # '/predict'エンドポイントを作成
def predict():
    # モデルとデータセットをロード
    model = GCN(dataset.num_features, 16, dataset.num_classes)  # GCNモデルを初期化
    model.load_state_dict(torch.load('path_to_model.pth'))  # 学習済みのモデルをロード
    model.eval()  # モデルを評価モードに設定

    # リクエストからデータを取得
    data = request.get_json()  # JSONデータを取得
    x = torch.tensor(data['x'])  # 入力データをテンソルに変換
    edge_index = torch.tensor(data['edge_index'])  # エッジインデックスをテンソルに変換
    
    # 予測を実行
    with torch.no_grad():  # 勾配計算を無効化
        pred = model(x, edge_index)  # モデルを使用して予測を行う
    
    # 予測結果をJSON形式で返す
    return jsonify(pred.tolist())  # 予測結果をJSON形式で返す

if __name__ == '__main__':
    app.run(debug=True)  # デバッグモードでアプリケーションを実行
