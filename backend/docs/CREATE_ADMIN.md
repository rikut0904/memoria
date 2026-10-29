# 管理者アカウントの作成

Clerkで先に管理者ユーザーを作成し、そのユーザーIDをアプリケーションDBへ登録します。

## 前提条件

- PostgreSQLとバックエンドが起動していること
- Clerkのユーザー登録が完了していること
- ClerkユーザーID（`user_...`）を確認できること

## 実行方法

```bash
make admin
```

対話形式でメールアドレス、ClerkユーザーID、表示名を入力します。

または、バックエンドコンテナ内で直接指定できます。

```bash
docker compose exec backend /app/create-admin \
  -email="admin@example.com" \
  -clerk-user-id="user_xxxxxxxxxxxxx" \
  -name="管理者"
```

このコマンドはClerk側のアカウントを作成・削除しません。ClerkアカウントはClerk Dashboardで管理し、コマンドはDB上の管理者レコードだけを作成します。

## 確認

作成後、Clerkで対象ユーザーとしてログインし、管理画面へアクセスします。

メールアドレスまたはClerkユーザーIDが既にDBに存在する場合は、重複作成を防ぐためエラーになります。
