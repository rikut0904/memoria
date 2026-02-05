# Screens (Draft)

## Auth
- ログイン（/login）
- 新規登録（/signup）
- 招待トークン入力（/invites/[token]）

## Group Selection
- グループ選択画面（/）
- グループ作成

## Group Home
- グループホーム（/[groupId]）
- タイムライン（最新の投稿/写真/通知）

## Posts
- 投稿一覧（/[groupId]/posts）
- 投稿詳細 
- 投稿作成/編集（/[groupId]/posts/new）

## Albums
- アルバム一覧（/[groupId]/albums）
- アルバム詳細（写真一覧・関連投稿）
- アルバム作成/編集（/[groupId]/albums/new）

## Photos
- 写真アップロード 
- 写真詳細 

## Tags
- タグ検索結果 

## Notifications
- 通知一覧 
- 通知設定 

## Anniversaries
- 記念日一覧 
- 記念日作成/編集 

## Trips
- 旅行一覧（/[groupId]/trips）
- 旅行詳細（/[groupId]/trips/[id]）
  - 概要タブ（OverviewTab）
  - スケジュールタブ（ScheduleTab）
  - 交通タブ（TransportTab）
  - 宿泊タブ（LodgingTab）
  - 予算タブ（BudgetTab）
- 旅行作成（/[groupId]/trips/new）

## Group Management
- グループ管理（/[groupId]/manage）
- グループ設定 
- グループ削除 
- メンバー招待

## Subscription 
- プラン選択・アップグレード
- → Stripe Checkoutへリダイレクト
- プラン管理（変更・解約）
- → Stripe Customer Portalへリダイレクト

## Admin（システム管理者）
- ユーザー管理（/admin/users）
- サブスク一覧・統計 （/admin/subscriptions）
- 売上レポート （/admin/reports）

## 共通UI
- ハンバーガーメニュー（モバイル）
- ヘッダー（ナビゲーション）
- 広告表示エリア（Freeプランのみ）
