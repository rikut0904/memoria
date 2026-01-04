package repository

import "memoria/internal/domain/model"

type NotificationRepository interface {
	Create(notification *model.Notification) error
	FindByUserID(userID uint) ([]*model.Notification, error)
	MarkAsRead(id uint) error
}

type NotificationSettingRepository interface {
	FindByUserID(userID uint) ([]*model.NotificationSetting, error)
	Upsert(setting *model.NotificationSetting) error
}

type WebPushSubscriptionRepository interface {
	Create(subscription *model.WebPushSubscription) error
	FindByUserID(userID uint) ([]*model.WebPushSubscription, error)
	Delete(id uint) error
}
