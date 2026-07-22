TradingCardDashboard Mobile v2.2（Supabase接続情報設定済み）

Project URLとPublishable keyは設定済みです。
SQLセットアップも実行済みなら、残りはログインとアップロードです。

PCでの初回操作
1. index.htmlをWebサーバー上で開く
2. JSONを読み込む
3. 「クラウド同期」を開く
4. 「接続情報を保存」
5. メールアドレスとパスワードで「新規登録」または「ログイン」
6. 「現在データをアップロード」

スマホでの操作
1. 同じWebページを開く
2. 同じアカウントでログイン
3. 「最新データをダウンロード」

注意
- URLに /rest/v1/ を入力しても自動でProject URLへ補正します。
- service_role / secret keyは絶対に使用しないでください。
- Publishable keyはブラウザ用ですが、RLSポリシーを維持してください。
