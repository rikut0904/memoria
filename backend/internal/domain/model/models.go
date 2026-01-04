package model

import "time"

// BaseModel keeps standard fields for all tables.
type BaseModel struct {
	ID        uint      `gorm:"primaryKey"`
	CreatedAt time.Time `gorm:"not null"`
	UpdatedAt time.Time `gorm:"not null"`
}

type User struct {
	BaseModel
	FirebaseUID string `gorm:"uniqueIndex;not null"`
	Email       string `gorm:"uniqueIndex;not null"`
	DisplayName string
	Role        string `gorm:"not null"` // admin, member
}

type Invite struct {
	BaseModel
	Email      string    `gorm:"not null;index"`
	Token      string    `gorm:"uniqueIndex;not null"`
	Status     string    `gorm:"not null"` // pending, accepted, revoked, expired
	Role       string    `gorm:"not null;default:user"` // admin, user
	ExpiresAt  time.Time `gorm:"not null"`
	InvitedBy  uint      `gorm:"not null"`
}

type Album struct {
	BaseModel
	Title       string `gorm:"not null"`
	Description string
	CoverPhotoID *uint
	CreatedBy   uint `gorm:"not null"`
}

type Photo struct {
	BaseModel
	AlbumID     uint   `gorm:"not null;index"`
	S3Key       string `gorm:"uniqueIndex;not null"`
	ContentType string
	SizeBytes   int64
	Width       int
	Height      int
	UploadedBy  uint `gorm:"not null"`
}

type Post struct {
	BaseModel
	Type        string    `gorm:"not null"` // blog, memo
	Title       string
	Body        string    `gorm:"not null"`
	AuthorID    uint      `gorm:"not null"`
	PublishedAt time.Time `gorm:"not null"`
}

type AlbumPost struct {
	AlbumID uint `gorm:"primaryKey"`
	PostID  uint `gorm:"primaryKey"`
	CreatedAt time.Time `gorm:"not null"`
}

type Tag struct {
	BaseModel
	Name string `gorm:"uniqueIndex;not null"`
}

type PostTag struct {
	PostID uint `gorm:"primaryKey"`
	TagID  uint `gorm:"primaryKey"`
	CreatedAt time.Time `gorm:"not null"`
}

type PostPhoto struct {
	PostID  uint `gorm:"primaryKey"`
	PhotoID uint `gorm:"primaryKey"`
	CreatedAt time.Time `gorm:"not null"`
}

type PostLike struct {
	PostID uint `gorm:"primaryKey"`
	UserID uint `gorm:"primaryKey"`
	CreatedAt time.Time `gorm:"not null"`
}

type PostComment struct {
	BaseModel
	PostID   uint   `gorm:"not null;index"`
	UserID   uint   `gorm:"not null"`
	Body     string `gorm:"not null"`
}

type NotificationSetting struct {
	BaseModel
	UserID   uint   `gorm:"not null;index"`
	Category string `gorm:"not null"` // new_post, new_comment, anniversary, trip
	Enabled  bool   `gorm:"not null"`
}

type Notification struct {
	BaseModel
	UserID   uint   `gorm:"not null;index"`
	Category string `gorm:"not null"`
	Title    string `gorm:"not null"`
	Body     string `gorm:"not null"`
	ReadAt   *time.Time
}

type WebPushSubscription struct {
	BaseModel
	UserID    uint   `gorm:"not null;index"`
	Endpoint  string `gorm:"not null"`
	Auth      string `gorm:"not null"`
	P256dh    string `gorm:"not null"`
}

type Anniversary struct {
	BaseModel
	Title             string    `gorm:"not null"`
	Date              time.Time `gorm:"not null"`
	RemindDaysBefore  int       `gorm:"not null"`
	RemindAt          *time.Time
	Note              string
	CreatedBy         uint `gorm:"not null"`
}

type Trip struct {
	BaseModel
	Title       string    `gorm:"not null"`
	StartAt     time.Time `gorm:"not null"`
	EndAt       time.Time `gorm:"not null"`
	Note        string
	CreatedBy   uint `gorm:"not null"`
	NotifyAt    *time.Time
}

type TripItinerary struct {
	BaseModel
	TripID   uint      `gorm:"not null;index"`
	Title    string    `gorm:"not null"`
	StartAt  time.Time `gorm:"not null"`
	EndAt    time.Time `gorm:"not null"`
	Location string
	Note     string
}

type TripWishlist struct {
	BaseModel
	TripID   uint   `gorm:"not null;index"`
	Title    string `gorm:"not null"`
	Location string
	Note     string
	Priority int
}

type TripExpense struct {
	BaseModel
	TripID   uint   `gorm:"not null;index"`
	Title    string `gorm:"not null"`
	Category string `gorm:"not null"`
	Amount   int64  `gorm:"not null"`
	Currency string `gorm:"not null"`
	IsActual bool   `gorm:"not null"`
	Note     string
}
