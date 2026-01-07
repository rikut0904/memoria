package repository

import "memoria/internal/domain/model"

type TripRelationRepository interface {
	AddAlbums(tripID uint, albumIDs []uint) error
	AddPosts(tripID uint, postIDs []uint) error
	FindAlbumsByTripID(tripID uint) ([]*model.Album, error)
	FindPostsByTripID(tripID uint) ([]*model.Post, error)
}
