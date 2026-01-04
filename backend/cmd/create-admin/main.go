package main

import (
	"bufio"
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"strings"

	"memoria/internal/adapter/auth"
	"memoria/internal/adapter/persistence"
	"memoria/internal/config"
	"memoria/internal/domain/model"

	fbauth "firebase.google.com/go/v4/auth"
	"gorm.io/gorm"
)

func main() {
	// コマンドラインフラグの定義
	email := flag.String("email", "", "管理者のメールアドレス")
	password := flag.String("password", "", "パスワード（Firebaseユーザーを新規作成する場合）")
	firebaseUID := flag.String("firebase-uid", "", "既存のFirebaseユーザーのUID（指定した場合は新規作成しない）")
	displayName := flag.String("name", "", "表示名")
	flag.Parse()

	// 設定の読み込み
	cfg := config.Load()

	// データベース接続
	db, err := persistence.NewDB(cfg)
	if err != nil {
		log.Fatalf("データベース接続に失敗しました: %v", err)
	}

	// Firebase認証の初期化
	firebaseAuth, err := auth.NewFirebaseAuth(cfg.FirebaseProjectID, cfg.FirebaseClientEmail, cfg.FirebasePrivateKey)
	if err != nil {
		log.Fatalf("Firebase認証の初期化に失敗しました: %v", err)
	}

	// インタラクティブモード
	reader := bufio.NewReader(os.Stdin)
	ctx := context.Background()

	if *email == "" {
		fmt.Print("管理者のメールアドレスを入力してください: ")
		emailInput, _ := reader.ReadString('\n')
		emailInput = strings.TrimSpace(emailInput)
		email = &emailInput
	}

	// Firebase UIDが指定されていない場合は新規作成
	var finalFirebaseUID string
	if *firebaseUID == "" {
		if *password == "" {
			fmt.Print("パスワードを入力してください（8文字以上）: ")
			pwInput, _ := reader.ReadString('\n')
			pwInput = strings.TrimSpace(pwInput)
			password = &pwInput
		}

		// Firebaseユーザーを作成
		fmt.Println("\nFirebaseユーザーを作成中...")
		fbUser, err := createFirebaseUser(ctx, firebaseAuth, *email, *password)
		if err != nil {
			log.Fatalf("Firebaseユーザーの作成に失敗しました: %v", err)
		}
		finalFirebaseUID = fbUser.UID
		fmt.Printf("✓ Firebaseユーザーを作成しました (UID: %s)\n", fbUser.UID)
	} else {
		finalFirebaseUID = *firebaseUID
	}

	if *displayName == "" {
		fmt.Print("表示名を入力してください（省略可）: ")
		nameInput, _ := reader.ReadString('\n')
		nameInput = strings.TrimSpace(nameInput)
		if nameInput != "" {
			displayName = &nameInput
		} else {
			// 表示名が空の場合はメールアドレスの@より前を使用
			parts := strings.Split(*email, "@")
			displayName = &parts[0]
		}
	}

	// 既存ユーザーの確認
	if err := checkExistingUser(db, *email, finalFirebaseUID); err != nil {
		log.Fatalf("エラー: %v", err)
	}

	// 管理者ユーザーの作成
	user := &model.User{
		FirebaseUID: finalFirebaseUID,
		Email:       *email,
		DisplayName: *displayName,
		Role:        "admin",
	}

	if err := db.Create(user).Error; err != nil {
		log.Fatalf("管理者ユーザーの作成に失敗しました: %v", err)
	}

	fmt.Printf("\n✓ 管理者ユーザーを作成しました\n")
	fmt.Printf("  ID: %d\n", user.ID)
	fmt.Printf("  Email: %s\n", user.Email)
	fmt.Printf("  表示名: %s\n", user.DisplayName)
	fmt.Printf("  Role: %s\n", user.Role)
	fmt.Printf("  Firebase UID: %s\n", user.FirebaseUID)
	if *firebaseUID == "" {
		fmt.Printf("\nこのメールアドレスとパスワードでログインできます。\n")
	}
}

func createFirebaseUser(ctx context.Context, firebaseAuth *auth.FirebaseAuth, email, password string) (*fbauth.UserRecord, error) {
	params := (&fbauth.UserToCreate{}).
		Email(email).
		Password(password).
		EmailVerified(true)

	user, err := firebaseAuth.CreateUser(ctx, params)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func checkExistingUser(db *gorm.DB, email, firebaseUID string) error {
	var count int64

	// メールアドレスの重複チェック
	if err := db.Model(&model.User{}).Where("email = ?", email).Count(&count).Error; err != nil {
		return fmt.Errorf("メールアドレスの確認に失敗しました: %v", err)
	}
	if count > 0 {
		return fmt.Errorf("このメールアドレスは既に使用されています: %s", email)
	}

	// Firebase UIDの重複チェック
	if err := db.Model(&model.User{}).Where("firebase_uid = ?", firebaseUID).Count(&count).Error; err != nil {
		return fmt.Errorf("Firebase UIDの確認に失敗しました: %v", err)
	}
	if count > 0 {
		return fmt.Errorf("このFirebase UIDは既に使用されています: %s", firebaseUID)
	}

	return nil
}
