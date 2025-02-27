[![Chrome ウェブストアからインストール](storeLogo.png)](https://chromewebstore.google.com/detail/%E9%96%A2%E5%A4%A7%E5%9B%B3%E6%9B%B8%E9%A4%A8%E6%A4%9C%E7%B4%A2/lachkpnbdncfhjpajficgejkpnkdiljp?hl=ja)

# 関大図書館検索 Chrome 拡張機能

Amazon・楽天ブックスの商品ページから、関西大学図書館の蔵書を簡単に検索できる Chrome 拡張機能です。

## サンプル画像

![サンプル画像](https://i.gyazo.com/38265da37e0def8c6961e8ebb9a428e8.gif)

## 機能

- Amazon・楽天ブックスの商品ページで自動的に ISBN を取得
- 関西大学図書館の蔵書を即座に検索
- 検索結果を右端のアイコンで視覚的に表示
  - 🟢 緑色：蔵書あり
  - 🔴 赤色：蔵書なし
  - 🟡 黄色：検索中
- アイコンをクリックすると詳細な蔵書情報を表示

## 対応サイト

- Amazon.co.jp（書籍ページ）
- 楽天ブックス

## インストール方法

1. [Chrome ウェブストア](https://chromewebstore.google.com/detail/%E9%96%A2%E5%A4%A7%E5%9B%B3%E6%9B%B8%E9%A4%A8%E6%A4%9C%E7%B4%A2/lachkpnbdncfhjpajficgejkpnkdiljp?hl=ja)にアクセス
2. 「Chrome に追加」をクリック
3. インストール完了

## 使い方

1. Amazon・楽天ブックスの書籍ページにアクセス
2. 自動的に右端にアイコンが表示され、蔵書検索を実行
3. アイコンをクリックすると詳細情報を確認可能

## プライバシーポリシー

- 本拡張機能は、表示中のページから ISBN のみを取得します
- 取得した ISBN は関西大学図書館の蔵書検索にのみ使用され、他の目的では使用しません
- 検索結果は一時的にブラウザ内に保存されますが、ページを離れると削除されます
- ユーザーの個人情報は一切収集しません

## 開発者向け情報

### 必要な権限

- `activeTab`: 現在のタブのコンテンツにアクセス
- `storage`: 検索結果の一時保存
- その他必要最小限の権限のみ使用

### ソースコード

GitHub で公開: [koala-search](https://github.com/inoue2002/koala-search)

## お問い合わせ

バグ報告や機能要望は[GitHub の Issue](https://github.com/inoue2002/koala-search/issues)にてお願いします。
