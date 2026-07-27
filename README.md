# scrumtechnology.jp — 会社案内サイト

株式会社Scrum Technology の会社案内（1ページ）。GitHub Pages で配信する。

## なぜ作ったか

B2Bのコールドメールを `yasu@scrumtechnology.jp` から送る計画に対し、
**このドメインにサイトが無い**（Aレコード未設定）ことが分かった。
コールドメールを受け取った相手が最初にするのは差出人の検索なので、
月5万円の継続契約を検討する会社にとって、何も出てこないのは決定的に不利になる。
あわせて、特定電子メール法が求める「送信者を確認できる状態」もこのページで満たす。

もう1つの目的は名義の整合。`keiri-tools.com` の運営者情報は
「Masahiro Yasu が個人で運営しています」と書いてあり、法人からの提案と繋がらなかった。
このページに「経理ミニツールズを運営」と明記することで、
keiri-tools 側の誠実な記述を書き換えずに筋を通す。

## 構成

- `docs/index.html` — 1ページのみ（自己完結。外部CSS・外部JS・Webフォント・外部画像に依存しない）。<br>Fable(claude-fable-5)とCodex(gpt-5.6)に同じ仕様で並走させ、Fable案を採用。
- `docs/CNAME` — `scrumtechnology.jp`

light/dark 両対応・モバイル対応。JSON-LD で Organization を出している。

## 公開手順

1. リポジトリを作って push（公開リポジトリ。keiri-tools / ai-times と同じ扱い）
2. GitHub Pages を有効化: source = `main` ブランチの `/docs`
3. **DNS に Aレコードを追加**（Masahiroの作業）。GitHub Pages の Apex 用IP:
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```
   ※ **MXレコード（Google Workspace）は触らない。** メールに影響しない
4. Pages の設定で HTTPS を強制（証明書発行後）

## ★未確認（Masahiroの確認が必要）

推測で埋めていない項目。必要なら追記する:

- **法人番号** — 記載していない（公表サイトで引けるが、当方で確認していない）
- **設立年月** — 不明
- **資本金** — 不明
- **事業内容の文言** — 「Webサービスの企画・開発・運営／業務データの検算・突合に関する
  ソフトウェアの開発」と書いたが、**登記上の目的と一致しているか未確認**。
  登記と食い違うと信用を損なうので、公開前に確認すること

## DMARC（別途・DNSの作業）

SPF と DKIM は設定済みだが **DMARC が無い**。コールドメールは受信側フィルタが厳しく、
無いと迷惑メールに入りやすい。まず監視モードで入れる（既存メールの配送には影響しない）:

```
_dmarc.scrumtechnology.jp  TXT  "v=DMARC1; p=none; rua=mailto:yasu@scrumtechnology.jp"
```

しばらく運用してレポートを見てから `p=quarantine` を検討する。
