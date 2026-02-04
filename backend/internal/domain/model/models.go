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

type Group struct {
	BaseModel
	Name      string `gorm:"not null"`
	CreatedBy uint   `gorm:"not null"`
}

type GroupMember struct {
	GroupID  uint      `gorm:"primaryKey"`
	UserID   uint      `gorm:"primaryKey"`
	Role     string    `gorm:"not null"` // manager, member
	JoinedAt time.Time `gorm:"not null"`
}

type Invite struct {
	BaseModel
	GroupID    uint      `gorm:"not null;index"`
	Email      string    `gorm:"not null;index"`
	Token      string    `gorm:"uniqueIndex;not null"`
	Status     string    `gorm:"not null"` // pending, accepted, declined, expired
	Role       string    `gorm:"not null;default:member"` // manager, member
	ExpiresAt  time.Time `gorm:"not null"`
	InvitedBy  uint      `gorm:"not null"`
}

type Album struct {
	BaseModel
	GroupID     uint   `gorm:"not null;index"`
	Title       string `gorm:"not null"`
	Description string
	CoverPhotoID *uint
	CreatedBy   uint `gorm:"not null"`
}

type Photo struct {
	BaseModel
	GroupID     uint   `gorm:"not null;index"`
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
	GroupID     uint      `gorm:"not null;index"`
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
	Category string `gorm:"not null"` // new_post, new_comment, trip
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

type Trip struct {
	BaseModel
	GroupID     uint      `gorm:"not null;index"`
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

type TripAlbum struct {
	TripID    uint      `gorm:"primaryKey"`
	AlbumID   uint      `gorm:"primaryKey"`
	CreatedAt time.Time `gorm:"not null"`
}

type TripPost struct {
	TripID    uint      `gorm:"primaryKey"`
	PostID    uint      `gorm:"primaryKey"`
	CreatedAt time.Time `gorm:"not null"`
}

type TripScheduleItem struct {
	BaseModel
	TripID  uint   `gorm:"not null;index"`
	Date    string `gorm:"not null;index"` // YYYY-MM-DD
	Time    string `gorm:"not null"`       // HH:MM
	Content string `gorm:"not null"`
}

type TripTransport struct {
	BaseModel
	TripID                 uint    `gorm:"not null;index"`
	Mode                   string  `gorm:"not null"` // car, rental, train, shinkansen, ferry, flight, bus
	Date                   string  `gorm:"not null"` // YYYY-MM-DD
	FromLocation           string
	ToLocation             string
	Note                   string
	DepartureTime          string // HH:MM
	ArrivalTime            string // HH:MM
	RouteName              string
	TrainName              string
	FerryName              string
	FlightNumber           string
	Airline                string
	Terminal               string
	CompanyName            string
	PickupLocation         string
	DropoffLocation        string
	RentalURL              string
	DistanceKm             float64
	FuelEfficiencyKmPerL   float64
	GasolinePriceYenPerL   float64
	GasolineCostYen        int64
	HighwayCostYen         int64
	RentalFeeYen           int64
	FareYen                int64
}

type TripLodging struct {
	BaseModel
	TripID            uint   `gorm:"not null;index"`
	Date              string `gorm:"not null"` // YYYY-MM-DD
	Name              string `gorm:"not null"`
	ReservationURL    string
	Address           string
	CheckIn           string // HH:MM
	CheckOut          string // HH:MM
	ReservationNumber string
	CostYen           int64
}

type TripBudgetItem struct {
	BaseModel
	TripID  uint   `gorm:"not null;index"`
	Name    string `gorm:"not null"`
	CostYen int64  `gorm:"not null"`
}
