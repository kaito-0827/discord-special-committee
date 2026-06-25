# Discord特別委員会 公式ページ

GitHub Pages向けの静的サイトです。

microCMSのAPIキーはブラウザへ配信せず、GitHub Actionsがデプロイ時にCMSデータを取得して静的JSONを生成します。

## ローカル確認

```sh
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000` を開いてください。

## microCMS設定

GitHubリポジトリの Settings → Secrets and variables → Actions に、次のRepository secretを登録します。

- `MICROCMS_API_KEY`: microCMSで再発行した読み取り専用APIキー

サービスドメインは `.github/workflows/deploy-pages.yml` の `MICROCMS_SERVICE_DOMAIN` で設定します。

## 公開設定

GitHubリポジトリの Settings → Pages で、公開元にGitHub Actionsを指定します。デプロイは次のタイミングで実行されます。

- `main`ブランチへのpush
- Actions画面からの手動実行
- 30分ごとの定期実行
