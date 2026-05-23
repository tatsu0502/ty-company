---
name: deploy
description: 合同会社TY配下のプロジェクトをCloudflare Pagesに公開する。各プロジェクトディレクトリ (例: homepage/) の静的ファイルをデプロイしたい時に使う。ユーザーが「デプロイして」「公開して」「本番に反映して」と言ったら起動する。
---

# Cloudflare Pages デプロイ手順

このリポジトリ ([ty-company](../../../)) は複数プロジェクトを配下に持つモノレポ構成。各プロジェクトを個別に Cloudflare Pages で公開する。Wrangler CLI で直接アップロードする方式 (GitHub連携なし)。

## プロジェクト一覧

| ディレクトリ | Cloudflare Pages プロジェクト名 | 公開URL | 種別 |
|---|---|---|---|
| `homepage/` | `ty-company` | https://ty-company.pages.dev | 素の HTML/CSS/JS (ビルド不要) |

新規プロジェクトを追加した場合は、この表を更新すること。

## デプロイ手順

### 1. ログイン状態を確認

```bash
wrangler whoami
```

未ログインなら一度だけ実行する (ブラウザが開く):

```bash
wrangler login
```

### 2. デプロイを実行

リポジトリルートから、デプロイ対象ディレクトリを指定して実行する。**homepage の場合**:

```bash
cd /Users/ty/work/ty-company && wrangler pages deploy homepage \
  --project-name=ty-company \
  --branch=main \
  --commit-dirty=true
```

- 第1引数 (`homepage`) がアップロード対象ディレクトリ。プロジェクトに応じて変える
- `--branch=main` で本番デプロイになる (省略するとプレビューデプロイ扱い)
- 初回実行時はプロジェクトが存在しないため、Wrangler が新規作成を促す。Production branch は `main` を指定する
- `--commit-dirty=true` は未コミットの変更があってもデプロイを許可するためのフラグ

### 3. 反映確認

```bash
curl -sI https://ty-company.pages.dev/ | head -1
```

HTTP 200 と最新内容が返ることを確認する。キャッシュにより数十秒〜数分のラグが出る場合がある。

## 新規プロジェクトを追加する場合

1. リポジトリルート直下に `<project-name>/` ディレクトリを作成し、静的ファイルを配置 (またはビルド成果物を出力)
2. このSKILLのプロジェクト一覧表に追加
3. 初回は `--project-name=<新プロジェクト名>` で `wrangler pages deploy <dir>` を実行。Cloudflare 上に新規プロジェクトが作成される
4. サブドメインは `<project-name>.pages.dev` になる

## 除外したいファイルがある場合

各プロジェクトディレクトリ内に `.assetsignore` を置くと `.gitignore` 互換でアップロード対象から除外できる。`.git/`, `.DS_Store` などは Wrangler が自動的に除外するため通常は不要。

## 環境変数 / シークレット

`homepage/` の問い合わせフォームは Web3Forms にクライアントサイドから直接 POST する設計のため、Cloudflare 側のシークレットは無い。Access Key は `homepage/index.html` 内の hidden input に記載されている。

## ロールバック

[dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → 対象プロジェクト → Deployments タブから過去のデプロイを「Rollback」可能。CLI からのロールバックは制約が多いのでダッシュボード経由を推奨。

## トラブルシューティング

- **`Project not found`** → プロジェクト名のタイポ。`wrangler pages project list` で確認
- **`Authentication error`** → `wrangler logout` → `wrangler login` で再認証
- **本番URLに反映されない** → `--branch=main` を付け忘れている可能性 (プレビューデプロイになっている)。出力の URL がプレビュー URL (`xxx.<project>.pages.dev` の形式でハッシュが付く) になっていないか確認
