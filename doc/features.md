# Features

## Groups
- グループ単位でデータを管理
- グループ作成・設定・削除
- グループメンバー管理（manager / member ロール）
- メンバー権限でもグループメンバー一覧を確認可能

## Posts (Blog/Memo)
- ブログ/メモ投稿
- タグ付けとタグ検索
- いいね/コメント
- アルバムとN:Nで紐づけ可能
- アルバムに紐づかない投稿も作成可能
- Qiita連携（投稿保存時にQiitaへ同時投稿）

## Albums/Photos
- アルバム作成
- 写真アップロード（S3署名URL）
- 写真と投稿を関連付け可能

## Invitations
- グループ単位の招待制
- グループ管理者（manager）が招待メール送信
- 招待時にロール（manager / member）を指定可能
- 状態: pending, accepted, declined, expired

## Notifications
- Web Push通知（FCM）
- Discord/Slack通知
- 通知カテゴリ: new_post, new_comment, anniversary, trip
- 投稿/コメントは即時通知
- 記念日/旅行は登録時に通知タイミングを指定
- カテゴリごとのON/OFF設定

## Anniversaries
- 記念日を登録
- 通知タイミング指定

## Trips
- 旅行を登録
- 旅行詳細機能:
  - スケジュール（日付・時間・内容）
  - 交通手段（車/レンタカー/電車/新幹線/フェリー/飛行機/バス）
  - 宿泊（宿名・予約URL・住所・チェックイン/アウト・費用）
  - 予算（項目名・費用）
- 旅行とアルバム/投稿の紐づけ
- 通知タイミング指定

## UI/UX
- ハンバーガーメニュー（モバイル対応）
- グループ選択画面
- アプリアイコン

## Subscription 
- Stripe連携
- Free / Premiumプラン
- 広告表示制御（Freeのみ広告あり）
- 機能制限（グループ数、アルバム数、容量等）
- Stripe Customer Portalでプラン変更・解約

## Admin（システム管理者）
- ユーザー一覧・管理
- ユーザーロール変更（admin/member）
- ユーザー削除
- サブスク状況確認 
