# ty-company

合同会社TYの社内モノレポ。複数プロジェクトをひとつのリポジトリで管理する。

- 法人番号: 7360003011712 ([国税庁公表サイト](https://www.houjin-bangou.nta.go.jp/henkorireki-johoto.html?selHouzinNo=7360003011712))
- 本店所在地: 北海道函館市
- 事業内容: 株式投資、アフィリエイト等

---

## ディレクトリ構造

```
ty-company/
├── homepage/                 # コーポレートサイト (https://ty-company.pages.dev/)
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── .claude/
│   ├── skills/
│   │   └── deploy/SKILL.md   # Claude Code向け デプロイ手順スキル
│   └── settings.local.json   # Claude Codeのローカル設定(自動生成)
├── .gitignore
├── README.md                 # このファイル
└── .git/
```

新規プロジェクトを追加する場合は、リポジトリルート直下に `<project-name>/` を作成する(モノレポのフラット構造を維持)。

---

## プロジェクト一覧

| ディレクトリ | 種別 | 公開URL | ホスティング | デプロイ方法 |
|---|---|---|---|---|
| [homepage/](homepage/) | 静的サイト (素のHTML/CSS/JS) | https://ty-company.pages.dev/ | Cloudflare Pages | Wrangler CLI |

---

## 使用技術・インフラ

### homepage (コーポレートサイト)

| レイヤー | 技術/サービス | 用途 | コスト |
|---|---|---|---|
| マークアップ | HTML5 | ページ構造 | — |
| スタイル | CSS3 (CSS Variables, Grid, Flexbox) | デザイン | — |
| スクリプト | Vanilla JavaScript (ES2020+) | フォーム送信処理 | — |
| ホスティング | [Cloudflare Pages](https://pages.cloudflare.com/) | 静的サイト配信・CDN・HTTPS | **無料** |
| 問い合わせフォーム | [Web3Forms](https://web3forms.com/) | フォーム送信先(バックエンド代替) | **無料**(月1000通) |
| ドメイン | `*.pages.dev` (Cloudflare提供サブドメイン) | 公開URL | **無料** |
| デプロイCLI | [Wrangler](https://developers.cloudflare.com/workers/wrangler/) | Cloudflareへのアップロード | **無料** |
| バージョン管理 | Git / GitHub | ソース管理 | **無料** |

### 開発・運用

| ツール | 用途 |
|---|---|
| [Claude Code](https://claude.com/claude-code) (VSCode拡張) | コード生成・編集・デプロイ実行 |
| [Playwright MCP](https://github.com/microsoft/playwright-mcp) | ブラウザ操作の自動化(動作確認・スクレイピング)。ユーザースコープで導入済み |

### 構成イメージ

```
   ブラウザ
      │
      ▼ HTTPS
   ┌─────────────────────────────────┐
   │  Cloudflare Pages CDN           │
   │  ty-company.pages.dev           │
   │  (homepage/index.html etc.)     │
   └─────────────────────────────────┘
              ▲
              │ wrangler pages deploy
              │
   開発者マシン (このリポジトリ)
              │
              │ フォーム送信時
              ▼
   ┌─────────────────────────────────┐
   │  Web3Forms                      │
   │  api.web3forms.com/submit       │
   │  (Access Key で認証)            │
   └─────────────────────────────────┘
              │
              ▼ メール転送
   tmpforsomething@gmail.com
```

---

## 初回セットアップ

新しいマシンでこのリポジトリを使う場合の手順。

### 1. リポジトリクローン

```bash
git clone git@github.com:tatsu0502/ty-company.git
cd ty-company
```

### 2. Node.js / npm

Node.js 18 以上が必要(`wrangler` と `@playwright/mcp` の動作要件)。

```bash
node -v   # v18+
npm -v
```

未インストールなら [nodejs.org](https://nodejs.org/) または `brew install node` で導入。

### 3. Wrangler CLI

Cloudflare Pages へのデプロイに使う。

```bash
npm install -g wrangler
wrangler login   # ブラウザでCloudflareアカウントに認証
wrangler whoami  # ログイン状態確認
```

### 4. (任意) Playwright MCP のChromeブラウザ

Playwright MCPはシステムインストール済みのGoogle Chromeを使うため、未インストールの場合は [google.com/chrome](https://www.google.com/chrome/) からインストール。

---

## デプロイ手順

### 自動 (Claude Code経由)

このリポジトリでClaude Codeを開いた状態で「**デプロイして**」と指示すると、[.claude/skills/deploy/SKILL.md](.claude/skills/deploy/SKILL.md) が起動して自動実行される。

### 手動 (CLI)

#### homepage を本番にデプロイ

```bash
wrangler pages deploy homepage \
  --project-name=ty-company \
  --branch=main \
  --commit-dirty=true
```

- `--branch=main` で **本番** デプロイ。省略するとプレビューデプロイ(`<hash>.<project>.pages.dev` でのみ公開)
- `--commit-dirty=true` は未コミット変更を許可するフラグ

#### 新規プロジェクトの初回デプロイ

```bash
# 1. プロジェクト作成 (1回だけ)
wrangler pages project create <project-name> --production-branch=main

# 2. デプロイ
wrangler pages deploy <project-dir> \
  --project-name=<project-name> \
  --branch=main \
  --commit-dirty=true
```

公開URLは `https://<project-name>.pages.dev/` になる。

### デプロイのロールバック

[Cloudflareダッシュボード](https://dash.cloudflare.com) → Workers & Pages → 対象プロジェクト → Deployments タブ → 過去のデプロイの「Rollback」ボタン。

---

## 動作確認

### サイトの疎通確認

```bash
# HTTPステータス
curl -sI https://ty-company.pages.dev/ | head -1
# → HTTP/2 200

# 全アセットの200確認
for path in / styles.css script.js; do
  printf "%-15s " "$path"
  curl -sI "https://ty-company.pages.dev$path" | head -1
done

# 特定のテキストが反映されているか
curl -s https://ty-company.pages.dev/ | grep "合同会社TY"
```

### ローカルプレビュー

ビルド工程がないので、`homepage/` ディレクトリで静的サーバーを立ち上げるだけ。

```bash
cd homepage
python3 -m http.server 8765
# → http://127.0.0.1:8765/
```

または

```bash
npx serve homepage -l 8765
```

### Cloudflare Pages プロジェクトの状態確認

```bash
wrangler pages project list                                # プロジェクト一覧
wrangler pages deployment list --project-name=ty-company   # デプロイ履歴
```

### 問い合わせフォームの動作確認

1. https://ty-company.pages.dev/#contact を開く
2. 各項目を入力して「送信する」をクリック
3. `tmpforsomething@gmail.com` 宛にメールが届けばOK(数秒〜数十秒)
4. 届かない場合は迷惑メールフォルダも確認
5. Web3Formsダッシュボード ([web3forms.com/dashboard](https://web3forms.com/dashboard)) で送信ログを確認可能

---

## 問い合わせフォーム (Web3Forms) の仕組み

[homepage/index.html](homepage/index.html) のフォームは JavaScript (fetch API) で `https://api.web3forms.com/submit` に POST する。Web3Forms 側で内容を確認のうえ、登録メールアドレス (`tmpforsomething@gmail.com`) に転送する。

### 設定箇所

[homepage/index.html](homepage/index.html) の hidden input にAccess Keyが記載されている:

```html
<input type="hidden" name="access_key" value="62e3f8fd-a916-4235-ad44-d49c6e39e5b8" />
<input type="hidden" name="subject" value="【合同会社TY】お問い合わせ" />
<input type="hidden" name="from_name" value="ty-company.pages.dev" />
```

Access Keyはサイト識別子であり、機密情報ではない(ドメイン制限・スパム対策はWeb3Forms側で行う)。

### スパム対策

- **Honeypot**: 隠しチェックボックス `botcheck` をBotが埋めると弾かれる
- **ドメイン制限**: Web3Forms登録時に `ty-company.pages.dev` を許可ドメインに設定済み

### 通数オーバー時の対応

月1000通を超える見込みになった場合の切替候補:

1. [Resend](https://resend.com/) (月3000通無料) + Cloudflare Pages Functions
2. [Formspree](https://formspree.io/) 有料プラン
3. Cloudflare Workers + 自前のSMTP

---

## Claude Code 連携

### デプロイスキル

[.claude/skills/deploy/SKILL.md](.claude/skills/deploy/SKILL.md) にデプロイ手順を集約。ユーザーが「デプロイして」「公開して」「本番に反映して」と発言するとClaude Codeが自動起動する。

新規プロジェクトを追加した時は、このSKILLの「プロジェクト一覧」表に行を追加すること。

### Playwright MCP (ユーザースコープ・全プロジェクト共通)

ブラウザ操作のMCPサーバーが `~/.claude.json` の `mcpServers.playwright` で設定済み。Chrome (ヘッドドモード) を起動して自動操作・スクリーンショット取得ができる。

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--headed"]
    }
  }
}
```

使い方の例: 「ty-company.pages.dev を開いてスクリーンショット撮って」「問い合わせフォームに動作確認用のメッセージを送って」

ヘッドレスに切り替えたい場合は `--headed` を外す。

---

## コスト

すべて **無料** で運用中(2026年5月時点)。

| 項目 | プラン | 制限 | 超過時の代替 |
|---|---|---|---|
| Cloudflare Pages | Free | 帯域・リクエスト数とも無制限。ビルド月500回(現状ビルド不要) | Workers Paid ($5/月) |
| Web3Forms | Free | 月1000通 | Resend Free (月3000通) など |
| Cloudflareサブドメイン (`pages.dev`) | — | 無制限 | 独自ドメイン取得(年1000円〜) |
| GitHub (public) | Free | 無制限 | — |
| Wrangler CLI | OSS | — | — |

将来コストが発生し得るタイミング:

- 独自ドメインを取得した時(年1000〜2000円程度)
- アクセス急増でWeb3Forms月1000通を超えた時(または有料機能が必要になった時)
- Cloudflare Workers有料機能(KV、D1、Queues等)を使いたくなった時

---

## トラブルシューティング

### `wrangler: command not found`

`npm install -g wrangler` でグローバルインストール。Node.js 18 以上が必要。

### `Project not found` エラー

プロジェクト名のタイポか、初回プロジェクト作成漏れ。

```bash
wrangler pages project list                                   # 既存プロジェクト一覧で名前確認
wrangler pages project create <name> --production-branch=main # 未作成なら作成
```

### `Authentication error`

```bash
wrangler logout
wrangler login   # ブラウザで再認証
```

### 本番URLに反映されない

- `--branch=main` を付け忘れているとプレビューデプロイ扱いになる。出力URLが `<hash>.ty-company.pages.dev` 形式ならプレビュー
- 反映には数十秒のラグがある。`curl` でHTMLを取得して中身を確認

### 問い合わせフォームから送信できない

ブラウザコンソール (F12 → Console) でエラーを確認。

- `フォームの送信先が未設定です` → `homepage/index.html` のAccess Keyがプレースホルダのまま。Web3Forms登録 → Access Key発行 → ファイル更新 → 再デプロイ
- ネットワークエラー → Web3FormsのドメインがChromeのブロッカーで弾かれていないか確認
- メールが届かない → 迷惑メールフォルダ、Web3Formsダッシュボードで送信ログ確認

### Gitリベース時の `unstaged changes` エラー

`.claude/settings.local.json` が自動更新されていることが多い。一時退避して操作する。

```bash
git stash push -u -m "tmp" -- .claude/settings.local.json
git rebase origin/main
git stash pop
```

---

## ライセンス・著作権

社内利用専用。外部公開・転載不可。

---

## 関連リンク

- 公開サイト: https://ty-company.pages.dev/
- GitHubリポジトリ: https://github.com/tatsu0502/ty-company
- Cloudflareダッシュボード: https://dash.cloudflare.com/
- Web3Formsダッシュボード: https://web3forms.com/dashboard
- 国税庁法人番号公表サイト: https://www.houjin-bangou.nta.go.jp/henkorireki-johoto.html?selHouzinNo=7360003011712
