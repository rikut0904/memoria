# デプロイ

## 環境

デプロイ環境は `stg` と `prod` を使用します。PRごとの preview 環境は作成しません。

| 環境 | 発火条件 | GitHub Environment |
| --- | --- | --- |
| `stg` | `main` への push、または手動実行 | `stg` |
| `prod` | 手動実行のみ | `prod` |

`prod` は `workflow_dispatch` 以外のイベントではジョブ条件を満たさないため、PR作成・更新や `main` への push ではデプロイされません。

## 初期設定

GitHub の Settings > Environments で `stg` と `prod` を作成し、それぞれに次の secret を登録します。

- `RAILWAY_TOKEN`: Railway project token
- `RAILWAY_PROJECT_ID`: Railway project ID
- `RAILWAY_SERVICE_ID`: Backend用Railway service ID
- `RAILWAY_ENVIRONMENT`: 対象Railway environment名またはID
- `DATABASE_URL`: 対象環境のPostgreSQL接続URL
- `VERCEL_TOKEN_FRONTEND`: `frontend` 用Vercel access token
- `VERCEL_TOKEN_AUTH`: `auth` 用Vercel access token
- `VERCEL_TOKEN_ADMIN`: `admin` 用Vercel access token
- `VERCEL_TOKEN_INFO`: `info` 用Vercel access token
- `VERCEL_TOKEN_CONTACT`: `contact` 用Vercel access token
- `VERCEL_TOKEN_HELP`: `help` 用Vercel access token
- `VERCEL_ORG_ID`: Vercel teamまたはユーザーのID
- `VERCEL_PROJECT_ID_FRONTEND`: `frontend` 用Vercel project ID
- `VERCEL_PROJECT_ID_AUTH`: `auth` 用Vercel project ID
- `VERCEL_PROJECT_ID_ADMIN`: `admin` 用Vercel project ID
- `VERCEL_PROJECT_ID_INFO`: `info` 用Vercel project ID
- `VERCEL_PROJECT_ID_CONTACT`: `contact` 用Vercel project ID
- `VERCEL_PROJECT_ID_HELP`: `help` 用Vercel project ID

`prod` には Required reviewers を設定してください。secret はリポジトリやログへ書き込まないでください。

## 実行方法

`main` への push では `stg` のみ自動デプロイされます。デプロイ前に専用の `migrate` job がデータベースを更新し、成功した場合だけRailway Backendと6つのVercelプロジェクトがデプロイされます。

本番デプロイは Actions の `CD prod` workflow を選択して実行します。`prod` Environment に承認者を設定した場合、承認されるまでRailway/Vercelのデプロイ処理は開始されません。

Backendの `AUTO_MIGRATE` は `stg` / `prod` では `false` にしてください。コード上のデフォルトもlocal以外は無効ですが、環境変数で明示的に `false` を設定します。アプリ起動時ではなく、CDの `migrate` jobだけがスキーマ変更を行います。

Railway Backendは `/` ディレクトリを `--path-as-root` で指定して、対象EnvironmentのServiceへデプロイします。Vercelの各プロジェクトは、GitHub Environmentごとに登録したproject IDへ `--prod` でデプロイします。stg用とprod用でVercelプロジェクトが分かれている場合は、各Environmentに異なるproject IDを登録してください。
