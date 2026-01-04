# 管理者アカウントの作成

このドキュメントでは、Memoriaアプリケーションの最初の管理者アカウントを作成する方法を説明します。

## 概要

Memoriaは招待制のアプリケーションですが、最初の管理者アカウントは手動で作成する必要があります。`create-admin`コマンドを使用すると、Firebaseユーザーとデータベースユーザーレコードを同時に作成できます。

## 前提条件

- バックエンドの環境変数が設定されていること（`backend/.env`）
- PostgreSQLデータベースが起動していること
- Firebase Admin SDKの認証情報が設定されていること

## 使用方法

### 方法1: インタラクティブモード（推奨）

コマンドラインで対話的に情報を入力します：

```bash
cd backend
go run cmd/create-admin/main.go
```

プロンプトに従って以下の情報を入力してください：

1. **メールアドレス**: 管理者のメールアドレス
2. **パスワード**: ログイン用のパスワード（8文字以上）
3. **表示名**: アプリ内で表示される名前（省略可）

### 方法2: コマンドライン引数

すべての情報をコマンドライン引数で指定することもできます：

```bash
cd backend
go run cmd/create-admin/main.go \
  -email="admin@example.com" \
  -password="SecurePass123" \
  -name="管理者"
```

### 方法3: 既存のFirebaseユーザーを使用

既にFirebaseコンソールでユーザーを作成済みの場合：

```bash
cd backend
go run cmd/create-admin/main.go \
  -email="admin@example.com" \
  -firebase-uid="existing-firebase-uid" \
  -name="管理者"
```

## オプション

- `-email`: 管理者のメールアドレス（必須）
- `-password`: パスワード（新規Firebaseユーザー作成時に必要）
- `-firebase-uid`: 既存のFirebaseユーザーUID（指定時はFirebaseユーザーを作成しない）
- `-name`: 表示名（省略時はメールアドレスの@より前が使用される）

## 実行例

### 新規管理者作成

```bash
$ cd backend
$ go run cmd/create-admin/main.go
管理者のメールアドレスを入力してください: admin@example.com
パスワードを入力してください（8文字以上）: MySecurePassword123
表示名を入力してください（省略可）: システム管理者

Firebaseユーザーを作成中...
✓ Firebaseユーザーを作成しました (UID: abc123def456...)

✓ 管理者ユーザーを作成しました
  ID: 1
  Email: admin@example.com
  表示名: システム管理者
  Role: admin
  Firebase UID: abc123def456...

このメールアドレスとパスワードでログインできます。
```

## Dockerコンテナ内での実行

Dockerコンテナ内で実行する場合：

```bash
# コンテナに入る
docker exec -it memoria_backend sh

# 管理者作成コマンドを実行
cd /app
./create-admin
```

または、ホストから直接実行：

```bash
docker exec -it memoria_backend /app/create-admin
```

## ビルド済みバイナリの作成

頻繁に使用する場合は、バイナリをビルドしておくと便利です：

```bash
cd backend
go build -o create-admin cmd/create-admin/main.go

# 実行
./create-admin -email="admin@example.com" -password="SecurePass123"
```

## トラブルシューティング

### エラー: データベース接続に失敗

- PostgreSQLが起動しているか確認してください
- `backend/.env`のデータベース設定を確認してください

### エラー: Firebase認証の初期化に失敗

- `backend/.env`のFirebase設定を確認してください
- `FIREBASE_PRIVATE_KEY`が正しくエスケープされているか確認してください

### エラー: このメールアドレスは既に使用されています

- データベースまたはFirebaseに既に同じメールアドレスのユーザーが存在します
- 別のメールアドレスを使用するか、既存のユーザーを削除してください

### エラー: パスワードが短すぎます

- Firebaseはパスワードの最小長を6文字と定めていますが、8文字以上を推奨します

## 次のステップ

管理者アカウントを作成したら：

1. フロントエンド（http://localhost:3000）にアクセス
2. 作成したメールアドレスとパスワードでログイン
3. ダッシュボードから招待を送信して他のユーザーを追加

## セキュリティの注意事項

- 作成したパスワードは安全に保管してください
- 本番環境では強力なパスワードを使用してください
- 管理者権限は必要最小限のユーザーにのみ付与してください
