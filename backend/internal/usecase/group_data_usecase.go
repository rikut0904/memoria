package usecase

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"memoria/internal/adapter/storage"
	"memoria/internal/domain/model"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

const groupDataExportVersion = 1

type ExportUser struct {
	ID          uint   `json:"id"`
	Email       string `json:"email"`
	DisplayName string `json:"display_name"`
}

type ExportMember struct {
	UserID   uint      `json:"user_id"`
	Email    string    `json:"email"`
	Role     string    `json:"role"`
	JoinedAt time.Time `json:"joined_at"`
}

type GroupDataExport struct {
	Version     int                      `json:"version"`
	ExportedAt  time.Time                `json:"exported_at"`
	Group       model.Group              `json:"group"`
	Users       []ExportUser             `json:"users"`
	Members     []ExportMember           `json:"members"`
	Albums      []model.Album            `json:"albums"`
	Photos      []model.Photo            `json:"photos"`
	Posts       []model.Post             `json:"posts"`
	Comments    []model.PostComment      `json:"comments"`
	Tags        []model.Tag              `json:"tags"`
	PostTags    []model.PostTag          `json:"post_tags"`
	AlbumPosts  []model.AlbumPost        `json:"album_posts"`
	PostPhotos  []model.PostPhoto        `json:"post_photos"`
	Likes       []model.PostLike         `json:"likes"`
	Trips       []model.Trip             `json:"trips"`
	Itineraries []model.TripItinerary    `json:"itineraries"`
	Wishlists   []model.TripWishlist     `json:"wishlists"`
	Expenses    []model.TripExpense      `json:"expenses"`
	TripAlbums  []model.TripAlbum        `json:"trip_albums"`
	TripPosts   []model.TripPost         `json:"trip_posts"`
	Schedules   []model.TripScheduleItem `json:"schedules"`
	Transports  []model.TripTransport    `json:"transports"`
	Lodgings    []model.TripLodging      `json:"lodgings"`
	Budgets     []model.TripBudgetItem   `json:"budgets"`
}

type GroupDataUsecase struct {
	db *gorm.DB
	s3 *storage.S3Service
}

func NewGroupDataUsecase(db *gorm.DB, s3 *storage.S3Service) *GroupDataUsecase {
	return &GroupDataUsecase{db: db, s3: s3}
}

type AccountDataExport struct {
	Version    int               `json:"version"`
	ExportedAt time.Time         `json:"exported_at"`
	User       ExportUser        `json:"user"`
	Groups     []GroupDataExport `json:"groups"`
}

func (u *GroupDataUsecase) ExportForUser(userID uint, groupID *uint) (*AccountDataExport, error) {
	var user model.User
	if err := u.db.First(&user, userID).Error; err != nil {
		return nil, err
	}
	query := u.db.Table("groups").Joins("JOIN group_members ON group_members.group_id = groups.id").Where("group_members.user_id = ?", userID).Order("groups.created_at DESC")
	if groupID != nil {
		query = query.Where("groups.id = ?", *groupID)
	}
	var groups []model.Group
	if err := query.Find(&groups).Error; err != nil {
		return nil, err
	}
	if groupID != nil && len(groups) == 0 {
		return nil, gorm.ErrRecordNotFound
	}
	result := &AccountDataExport{
		Version:    groupDataExportVersion,
		ExportedAt: time.Now().UTC(),
		User:       ExportUser{ID: user.ID, Email: user.Email, DisplayName: user.DisplayName},
		Groups:     make([]GroupDataExport, 0, len(groups)),
	}
	for _, group := range groups {
		data, err := u.Export(group.ID)
		if err != nil {
			return nil, err
		}
		result.Groups = append(result.Groups, *data)
	}
	return result, nil
}

func (u *GroupDataUsecase) Export(groupID uint) (*GroupDataExport, error) {
	var result GroupDataExport
	result.Version = groupDataExportVersion
	result.ExportedAt = time.Now().UTC()
	if err := u.db.First(&result.Group, groupID).Error; err != nil {
		return nil, err
	}
	var memberRows []struct {
		UserID      uint
		Email       string
		DisplayName string
		Role        string
		JoinedAt    time.Time
	}
	if err := u.db.Table("group_members").Select("group_members.user_id, users.email, users.display_name, group_members.role, group_members.joined_at").Joins("JOIN users ON users.id = group_members.user_id").Where("group_members.group_id = ?", groupID).Order("group_members.joined_at ASC").Order("group_members.user_id ASC").Scan(&memberRows).Error; err != nil {
		return nil, err
	}
	result.Members = make([]ExportMember, 0, len(memberRows))
	result.Users = make([]ExportUser, 0, len(memberRows))
	for _, row := range memberRows {
		result.Members = append(result.Members, ExportMember{UserID: row.UserID, Email: row.Email, Role: row.Role, JoinedAt: row.JoinedAt})
		result.Users = append(result.Users, ExportUser{ID: row.UserID, Email: row.Email, DisplayName: row.DisplayName})
	}
	queries := []struct {
		dst   any
		query string
		args  []any
	}{
		{&result.Albums, "group_id = ?", []any{groupID}},
		{&result.Photos, "group_id = ?", []any{groupID}},
		{&result.Posts, "group_id = ?", []any{groupID}},
		{&result.Trips, "group_id = ?", []any{groupID}},
	}
	for _, item := range queries {
		if err := u.db.Where(item.query, item.args...).Find(item.dst).Error; err != nil {
			return nil, err
		}
	}
	postIDs := idsOfPosts(result.Posts)
	tripIDs := idsOfTrips(result.Trips)
	if len(postIDs) > 0 {
		if err := u.db.Where("post_id IN ?", postIDs).Find(&result.Comments).Error; err != nil {
			return nil, err
		}
		if err := u.db.Where("post_id IN ?", postIDs).Find(&result.PostTags).Error; err != nil {
			return nil, err
		}
		if err := u.db.Where("post_id IN ?", postIDs).Find(&result.AlbumPosts).Error; err != nil {
			return nil, err
		}
		if err := u.db.Where("post_id IN ?", postIDs).Find(&result.PostPhotos).Error; err != nil {
			return nil, err
		}
		if err := u.db.Where("post_id IN ?", postIDs).Find(&result.Likes).Error; err != nil {
			return nil, err
		}
		if err := u.db.Where("id IN (?)", u.db.Table("post_tags").Select("tag_id").Where("post_id IN ?", postIDs)).Find(&result.Tags).Error; err != nil {
			return nil, err
		}
	}
	if len(tripIDs) > 0 {
		if err := u.db.Where("trip_id IN ?", tripIDs).Find(&result.Itineraries).Error; err != nil {
			return nil, err
		}
		if err := u.db.Where("trip_id IN ?", tripIDs).Find(&result.Wishlists).Error; err != nil {
			return nil, err
		}
		if err := u.db.Where("trip_id IN ?", tripIDs).Find(&result.Expenses).Error; err != nil {
			return nil, err
		}
		if err := u.db.Where("trip_id IN ?", tripIDs).Find(&result.TripAlbums).Error; err != nil {
			return nil, err
		}
		if err := u.db.Where("trip_id IN ?", tripIDs).Find(&result.TripPosts).Error; err != nil {
			return nil, err
		}
		if err := u.db.Where("trip_id IN ?", tripIDs).Find(&result.Schedules).Error; err != nil {
			return nil, err
		}
		if err := u.db.Where("trip_id IN ?", tripIDs).Find(&result.Transports).Error; err != nil {
			return nil, err
		}
		if err := u.db.Where("trip_id IN ?", tripIDs).Find(&result.Lodgings).Error; err != nil {
			return nil, err
		}
		if err := u.db.Where("trip_id IN ?", tripIDs).Find(&result.Budgets).Error; err != nil {
			return nil, err
		}
	}
	return &result, nil
}

func (u *GroupDataUsecase) Import(groupID, currentUserID uint, data *GroupDataExport) error {
	if data == nil || data.Version != groupDataExportVersion {
		return errors.New("unsupported export version")
	}
	var member model.GroupMember
	if err := u.db.Where("group_id = ? AND user_id = ?", groupID, currentUserID).First(&member).Error; err != nil {
		return err
	}
	if member.Role != "manager" {
		return errors.New("group manager access required")
	}
	return u.db.Transaction(func(tx *gorm.DB) error {
		userMap := map[uint]uint{}
		for _, exported := range data.Users {
			var user model.User
			if err := tx.Where("LOWER(email) = LOWER(?)", strings.TrimSpace(exported.Email)).First(&user).Error; err == nil {
				userMap[exported.ID] = user.ID
			}
		}
		userMap[currentUserID] = currentUserID
		albumMap := map[uint]uint{}
		photoMap := map[uint]uint{}
		postMap := map[uint]uint{}
		tripMap := map[uint]uint{}
		for _, album := range data.Albums {
			createdBy := mappedUser(userMap, album.CreatedBy, currentUserID)
			copy := album
			copy.ID = 0
			copy.GroupID = groupID
			copy.CreatedBy = createdBy
			copy.CoverPhotoID = nil
			if err := tx.Create(&copy).Error; err != nil {
				return err
			}
			albumMap[album.ID] = copy.ID
		}
		for _, photo := range data.Photos {
			copy := photo
			copy.ID = 0
			copy.GroupID = groupID
			copy.AlbumID = albumMap[photo.AlbumID]
			copy.UploadedBy = mappedUser(userMap, photo.UploadedBy, currentUserID)
			if copy.AlbumID == 0 {
				continue
			}
			var existing model.Photo
			if err := tx.Where("s3_key = ?", copy.S3Key).First(&existing).Error; err == nil {
				photoMap[photo.ID] = existing.ID
				continue
			}
			if err := tx.Create(&copy).Error; err != nil {
				return err
			}
			photoMap[photo.ID] = copy.ID
		}
		for _, album := range data.Albums {
			if album.CoverPhotoID == nil {
				continue
			}
			newAlbum, ok := albumMap[album.ID]
			newPhoto := photoMap[*album.CoverPhotoID]
			if !ok || newPhoto == 0 {
				continue
			}
			if err := tx.Model(&model.Album{}).Where("id = ?", newAlbum).Update("cover_photo_id", newPhoto).Error; err != nil {
				return err
			}
		}
		for _, post := range data.Posts {
			copy := post
			copy.ID = 0
			copy.GroupID = groupID
			copy.AuthorID = mappedUser(userMap, post.AuthorID, currentUserID)
			if err := tx.Create(&copy).Error; err != nil {
				return err
			}
			postMap[post.ID] = copy.ID
		}
		tagMap := map[uint]uint{}
		for _, tag := range data.Tags {
			var existing model.Tag
			if err := tx.Where("name = ?", tag.Name).First(&existing).Error; err == nil {
				tagMap[tag.ID] = existing.ID
				continue
			}
			copy := tag
			copy.ID = 0
			if err := tx.Create(&copy).Error; err != nil {
				return err
			}
			tagMap[tag.ID] = copy.ID
		}
		for _, relation := range data.PostTags {
			if postMap[relation.PostID] == 0 || tagMap[relation.TagID] == 0 {
				continue
			}
			if err := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&model.PostTag{PostID: postMap[relation.PostID], TagID: tagMap[relation.TagID], CreatedAt: relation.CreatedAt}).Error; err != nil {
				return err
			}
		}
		for _, relation := range data.AlbumPosts {
			if postMap[relation.PostID] == 0 || albumMap[relation.AlbumID] == 0 {
				continue
			}
			if err := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&model.AlbumPost{AlbumID: albumMap[relation.AlbumID], PostID: postMap[relation.PostID], CreatedAt: relation.CreatedAt}).Error; err != nil {
				return err
			}
		}
		for _, relation := range data.PostPhotos {
			if postMap[relation.PostID] == 0 || photoMap[relation.PhotoID] == 0 {
				continue
			}
			if err := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&model.PostPhoto{PostID: postMap[relation.PostID], PhotoID: photoMap[relation.PhotoID], CreatedAt: relation.CreatedAt}).Error; err != nil {
				return err
			}
		}
		for _, like := range data.Likes {
			if postMap[like.PostID] == 0 || userMap[like.UserID] == 0 {
				continue
			}
			if err := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&model.PostLike{PostID: postMap[like.PostID], UserID: userMap[like.UserID], CreatedAt: like.CreatedAt}).Error; err != nil {
				return err
			}
		}
		for _, comment := range data.Comments {
			if postMap[comment.PostID] == 0 {
				continue
			}
			copy := comment
			copy.ID = 0
			copy.PostID = postMap[comment.PostID]
			copy.UserID = mappedUser(userMap, comment.UserID, currentUserID)
			if err := tx.Create(&copy).Error; err != nil {
				return err
			}
		}
		for _, trip := range data.Trips {
			copy := trip
			copy.ID = 0
			copy.GroupID = groupID
			copy.CreatedBy = mappedUser(userMap, trip.CreatedBy, currentUserID)
			if err := tx.Create(&copy).Error; err != nil {
				return err
			}
			tripMap[trip.ID] = copy.ID
		}
		if err := importTripChildren(tx, data, tripMap, albumMap, postMap); err != nil {
			return err
		}
		return nil
	})
}

func (u *GroupDataUsecase) ImportAsNewGroup(currentUserID uint, data *GroupDataExport) (uint, error) {
	if data == nil || data.Version != groupDataExportVersion {
		return 0, errors.New("unsupported export version")
	}
	group := &model.Group{Name: data.Group.Name, CreatedBy: currentUserID}
	if err := u.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(group).Error; err != nil {
			return err
		}
		member := &model.GroupMember{GroupID: group.ID, UserID: currentUserID, Role: "manager", JoinedAt: time.Now()}
		return tx.Create(member).Error
	}); err != nil {
		return 0, err
	}
	if err := u.Import(group.ID, currentUserID, data); err != nil {
		_ = u.DeleteGroup(group.ID, currentUserID)
		return 0, err
	}
	return group.ID, nil
}

func (u *GroupDataUsecase) DeleteGroup(groupID, currentUserID uint) error {
	var member model.GroupMember
	if err := u.db.Where("group_id = ? AND user_id = ?", groupID, currentUserID).First(&member).Error; err != nil {
		return err
	}
	if member.Role != "manager" {
		return errors.New("group manager access required")
	}
	var photos []model.Photo
	if err := u.db.Where("group_id = ?", groupID).Find(&photos).Error; err != nil {
		return err
	}
	if err := u.db.Transaction(func(tx *gorm.DB) error {
		tripIDs := tx.Table("trips").Select("id").Where("group_id = ?", groupID)
		postIDs := tx.Table("posts").Select("id").Where("group_id = ?", groupID)
		albumIDs := tx.Table("albums").Select("id").Where("group_id = ?", groupID)
		photoIDs := tx.Table("photos").Select("id").Where("group_id = ?", groupID)
		for _, table := range []string{
			"trip_schedule_items", "trip_transports", "trip_lodgings",
			"trip_budget_items", "trip_wishlists", "trip_expenses",
			"trip_itineraries", "trip_albums", "trip_posts",
		} {
			if err := tx.Exec("DELETE FROM "+table+" WHERE trip_id IN (?)", tripIDs).Error; err != nil {
				return err
			}
		}
		for _, item := range []struct {
			table  string
			column string
			query  any
		}{
			{"post_comments", "post_id", postIDs}, {"post_likes", "post_id", postIDs},
			{"post_tags", "post_id", postIDs}, {"post_photos", "post_id", postIDs},
			{"album_posts", "post_id", postIDs},
			{"trip_albums", "album_id", albumIDs}, {"trip_posts", "post_id", postIDs},
		} {
			if err := tx.Exec("DELETE FROM "+item.table+" WHERE "+item.column+" IN (?)", item.query).Error; err != nil {
				return err
			}
		}
		for _, item := range []struct {
			table string
			query any
		}{
			{"trips", tripIDs}, {"posts", postIDs}, {"photos", photoIDs}, {"albums", albumIDs},
		} {
			if err := tx.Exec("DELETE FROM "+item.table+" WHERE id IN (?)", item.query).Error; err != nil {
				return err
			}
		}
		if err := tx.Where("group_id = ?", groupID).Delete(&model.Invite{}).Error; err != nil {
			return err
		}
		if err := tx.Where("group_id = ?", groupID).Delete(&model.GroupMember{}).Error; err != nil {
			return err
		}
		return tx.Delete(&model.Group{}, groupID).Error
	}); err != nil {
		return err
	}
	for _, photo := range photos {
		if u.s3 != nil && photo.S3Key != "" {
			_ = u.s3.DeleteObject(photo.S3Key)
		}
	}
	return nil
}

func importTripChildren(tx *gorm.DB, data *GroupDataExport, tripMap, albumMap, postMap map[uint]uint) error {
	for _, item := range data.Itineraries {
		copy := item
		copy.ID = 0
		copy.TripID = tripMap[item.TripID]
		if copy.TripID != 0 {
			if err := tx.Create(&copy).Error; err != nil {
				return err
			}
		}
	}
	for _, item := range data.Wishlists {
		copy := item
		copy.ID = 0
		copy.TripID = tripMap[item.TripID]
		if copy.TripID != 0 {
			if err := tx.Create(&copy).Error; err != nil {
				return err
			}
		}
	}
	for _, item := range data.Expenses {
		copy := item
		copy.ID = 0
		copy.TripID = tripMap[item.TripID]
		if copy.TripID != 0 {
			if err := tx.Create(&copy).Error; err != nil {
				return err
			}
		}
	}
	for _, item := range data.Schedules {
		copy := item
		copy.ID = 0
		copy.TripID = tripMap[item.TripID]
		if copy.TripID != 0 {
			if err := tx.Create(&copy).Error; err != nil {
				return err
			}
		}
	}
	for _, item := range data.Transports {
		copy := item
		copy.ID = 0
		copy.TripID = tripMap[item.TripID]
		if copy.TripID != 0 {
			if err := tx.Create(&copy).Error; err != nil {
				return err
			}
		}
	}
	for _, item := range data.Lodgings {
		copy := item
		copy.ID = 0
		copy.TripID = tripMap[item.TripID]
		if copy.TripID != 0 {
			if err := tx.Create(&copy).Error; err != nil {
				return err
			}
		}
	}
	for _, item := range data.Budgets {
		copy := item
		copy.ID = 0
		copy.TripID = tripMap[item.TripID]
		if copy.TripID != 0 {
			if err := tx.Create(&copy).Error; err != nil {
				return err
			}
		}
	}
	for _, item := range data.TripAlbums {
		if tripMap[item.TripID] != 0 && albumMap[item.AlbumID] != 0 {
			if err := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&model.TripAlbum{TripID: tripMap[item.TripID], AlbumID: albumMap[item.AlbumID], CreatedAt: item.CreatedAt}).Error; err != nil {
				return err
			}
		}
	}
	for _, item := range data.TripPosts {
		if tripMap[item.TripID] != 0 && postMap[item.PostID] != 0 {
			if err := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&model.TripPost{TripID: tripMap[item.TripID], PostID: postMap[item.PostID], CreatedAt: item.CreatedAt}).Error; err != nil {
				return err
			}
		}
	}
	return nil
}

func mappedUser(m map[uint]uint, id, fallback uint) uint {
	if mapped := m[id]; mapped != 0 {
		return mapped
	}
	return fallback
}
func idsOfPosts(posts []model.Post) []uint {
	result := make([]uint, 0, len(posts))
	for _, item := range posts {
		result = append(result, item.ID)
	}
	return result
}
func idsOfTrips(trips []model.Trip) []uint {
	result := make([]uint, 0, len(trips))
	for _, item := range trips {
		result = append(result, item.ID)
	}
	return result
}

func (d GroupDataExport) Validate() error {
	if d.Version != groupDataExportVersion {
		return fmt.Errorf("unsupported export version: %d", d.Version)
	}
	if d.Group.Name == "" {
		return errors.New("group name is required")
	}
	return nil
}

func (d AccountDataExport) Validate() error {
	if d.Version != groupDataExportVersion {
		return fmt.Errorf("unsupported export version: %d", d.Version)
	}
	if len(d.Groups) == 0 {
		return errors.New("the export contains no groups")
	}
	for _, group := range d.Groups {
		if err := group.Validate(); err != nil {
			return err
		}
	}
	return nil
}
