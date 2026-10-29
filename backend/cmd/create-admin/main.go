package main

import (
	"bufio"
	"flag"
	"fmt"
	"log"
	"os"
	"strings"

	"memoria/internal/adapter/persistence"
	"memoria/internal/config"
	"memoria/internal/domain/model"
)

func main() {
	email := flag.String("email", "", "管理者のメールアドレス")
	clerkUserID := flag.String("clerk-user-id", "", "ClerkユーザーID")
	displayName := flag.String("name", "", "表示名")
	flag.Parse()

	cfg := config.Load()
	if err := cfg.Validate(); err != nil {
		log.Fatalf("設定が不正です: %v", err)
	}
	db, err := persistence.NewDB(cfg)
	if err != nil {
		log.Fatalf("データベース接続に失敗しました: %v", err)
	}

	reader := bufio.NewReader(os.Stdin)
	if *email == "" {
		fmt.Print("管理者のメールアドレスを入力してください: ")
		value, _ := reader.ReadString('\n')
		*email = strings.TrimSpace(value)
	}
	if *clerkUserID == "" {
		fmt.Print("ClerkユーザーID（user_...）を入力してください: ")
		value, _ := reader.ReadString('\n')
		*clerkUserID = strings.TrimSpace(value)
	}
	if *displayName == "" {
		fmt.Print("表示名を入力してください（省略可）: ")
		value, _ := reader.ReadString('\n')
		*displayName = strings.TrimSpace(value)
		if *displayName == "" {
			*displayName = strings.Split(*email, "@")[0]
		}
	}
	if *email == "" || *clerkUserID == "" {
		log.Fatal("email and clerk-user-id are required")
	}

	var count int64
	if err := db.Model(&model.User{}).Where("email = ? OR clerk_user_id = ?", *email, *clerkUserID).Count(&count).Error; err != nil {
		log.Fatalf("既存ユーザーの確認に失敗しました: %v", err)
	}
	if count > 0 {
		log.Fatalf("メールアドレスまたはClerkユーザーIDが既に使用されています")
	}

	user := &model.User{ClerkUserID: *clerkUserID, Email: *email, DisplayName: *displayName, Role: "admin"}
	if err := db.Create(user).Error; err != nil {
		log.Fatalf("管理者ユーザーの作成に失敗しました: %v", err)
	}

	fmt.Printf("管理者ユーザーを作成しました: id=%d email=%s clerk_user_id=%s\n", user.ID, user.Email, user.ClerkUserID)
}
