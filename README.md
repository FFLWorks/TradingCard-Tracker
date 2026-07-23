# Card Nexus v14.5.1 — スマホWeb版

このフォルダの**中身をすべて**Gitリポジトリの最上位へアップロードしてください。
`index.html` がリポジトリ直下にあるため、静的ホスティングでそのまま公開できます。

## 含まれるもの

- `index.html`：スマホ・PC共通Webアプリ
- `manifest.webmanifest`：ホーム画面追加用設定
- `icon.svg`：アプリアイコン
- `.gitignore`：個人データや不要ファイルの誤登録防止

## 初回設定

公開後、Card Nexusの「設定」から以下を入力します。

1. Supabase Project URL
2. Supabase Publishable Key
3. メールアドレスとパスワード

Project URLとPublishable KeyはGit公開用ファイルには埋め込んでいません。ブラウザへ入力した設定は、その端末のローカルストレージに保存されます。

## GitHub Pagesで公開する場合

1. このフォルダ内の全ファイルをリポジトリ直下へアップロード
2. GitHubの `Settings` → `Pages`
3. `Deploy from a branch` を選択
4. 対象ブランチと `/ (root)` を指定

## 注意

- SupabaseのRLSとStorage Policyを必ず有効にしてください。
- `service_role` キー、パスワード、バックアップJSON、実際の資産データはGitへ上げないでください。
- Electron専用の自動ローカルバックアップ機能はWeb版では利用できません。手動バックアップとクラウド同期は利用できます。
