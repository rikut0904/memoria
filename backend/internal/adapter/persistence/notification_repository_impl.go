package persistence

import (
	"memoria/internal/domain/model"
	"memoria/internal/domain/repository"
	"time"

	"gorm.io/gorm"
)

type notificationRepositoryImpl struct {
	db *gorm.DB
}

func NewNotificationRepository(db *gorm.DB) repository.NotificationRepository {
	return &notificationRepositoryImpl{db: db}
}

func (r *notificationRepositoryImpl) Create(notification *model.Notification) error {
	return r.db.Create(notification).Error
}

func (r *notificationRepositoryImpl) FindByUserID(userID uint) ([]*model.Notification, error) {
	var notifications []*model.Notification
	if err := r.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&notifications).Error; err != nil {
		return nil, err
	}
	return notifications, nil
}

func (r *notificationRepositoryImpl) MarkAsRead(id uint) error {
	now := time.Now()
	return r.db.Model(&model.Notification{}).Where("id = ?", id).Update("read_at", now).Error
}

type notificationSettingRepositoryImpl struct {
	db *gorm.DB
}

func NewNotificationSettingRepository(db *gorm.DB) repository.NotificationSettingRepository {
	return &notificationSettingRepositoryImpl{db: db}
}

func (r *notificationSettingRepositoryImpl) FindByUserID(userID uint) ([]*model.NotificationSetting, error) {
	var settings []*model.NotificationSetting
	if err := r.db.Where("user_id = ?", userID).Find(&settings).Error; err != nil {
		return nil, err
	}
	return settings, nil
}

func (r *notificationSettingRepositoryImpl) Upsert(setting *model.NotificationSetting) error {
	return r.db.Save(setting).Error
}

type webPushSubscriptionRepositoryImpl struct {
	db *gorm.DB
}

func NewWebPushSubscriptionRepository(db *gorm.DB) repository.WebPushSubscriptionRepository {
	return &webPushSubscriptionRepositoryImpl{db: db}
}

func (r *webPushSubscriptionRepositoryImpl) Create(subscription *model.WebPushSubscription) error {
	return r.db.Create(subscription).Error
}

func (r *webPushSubscriptionRepositoryImpl) FindByUserID(userID uint) ([]*model.WebPushSubscription, error) {
	var subscriptions []*model.WebPushSubscription
	if err := r.db.Where("user_id = ?", userID).Find(&subscriptions).Error; err != nil {
		return nil, err
	}
	return subscriptions, nil
}

func (r *webPushSubscriptionRepositoryImpl) Delete(id uint) error {
	return r.db.Delete(&model.WebPushSubscription{}, id).Error
}
