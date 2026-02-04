package handler

import (
	"net/http"
	"strconv"
	"time"

	"memoria/internal/domain/model"
	"memoria/internal/usecase"

	"github.com/labstack/echo/v4"
)

type TripHandler struct {
	tripUsecase *usecase.TripUsecase
}

func NewTripHandler(tripUsecase *usecase.TripUsecase) *TripHandler {
	return &TripHandler{
		tripUsecase: tripUsecase,
	}
}

type CreateTripRequest struct {
	Title    string  `json:"title" validate:"required"`
	StartAt  string  `json:"start_at" validate:"required"`
	EndAt    string  `json:"end_at" validate:"required"`
	Note     string  `json:"note"`
	NotifyAt *string `json:"notify_at"`
	AlbumIDs []uint  `json:"album_ids"`
	PostIDs  []uint  `json:"post_ids"`
}

type UpdateTripRequest struct {
	Title    string  `json:"title" validate:"required"`
	StartAt  string  `json:"start_at" validate:"required"`
	EndAt    string  `json:"end_at" validate:"required"`
	Note     string  `json:"note"`
	NotifyAt *string `json:"notify_at"`
}

type TripAlbumResponse struct {
	ID          uint   `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

type TripPostResponse struct {
	ID          uint   `json:"id"`
	Type        string `json:"type"`
	Title       string `json:"title"`
	Body        string `json:"body"`
	PublishedAt string `json:"published_at"`
}

type TripResponse struct {
	ID        uint    `json:"id"`
	Title     string  `json:"title"`
	StartAt   string  `json:"start_at"`
	EndAt     string  `json:"end_at"`
	Note      string  `json:"note"`
	CreatedBy uint    `json:"created_by"`
	NotifyAt  *string `json:"notify_at,omitempty"`
	CreatedAt string  `json:"created_at"`
	Albums    []TripAlbumResponse `json:"albums,omitempty"`
	Posts     []TripPostResponse  `json:"posts,omitempty"`
}

type TripScheduleItemPayload struct {
	Date    string `json:"date"`
	Time    string `json:"time"`
	Content string `json:"content"`
}

type TripScheduleItemRequest struct {
	TripScheduleItemPayload
}

type TripScheduleItemResponse struct {
	ID      uint   `json:"id"`
	TripScheduleItemPayload
}

type TripTransportPayload struct {
	Mode                 string  `json:"mode"`
	Date                 string  `json:"date"`
	FromLocation         string  `json:"from_location"`
	ToLocation           string  `json:"to_location"`
	Note                 string  `json:"note"`
	DepartureTime        string  `json:"departure_time"`
	ArrivalTime          string  `json:"arrival_time"`
	RouteName            string  `json:"route_name"`
	TrainName            string  `json:"train_name"`
	FerryName            string  `json:"ferry_name"`
	FlightNumber         string  `json:"flight_number"`
	Airline              string  `json:"airline"`
	Terminal             string  `json:"terminal"`
	CompanyName          string  `json:"company_name"`
	PickupLocation       string  `json:"pickup_location"`
	DropoffLocation      string  `json:"dropoff_location"`
	RentalURL            string  `json:"rental_url"`
	DistanceKm           float64 `json:"distance_km"`
	FuelEfficiencyKmPerL float64 `json:"fuel_efficiency_km_per_l"`
	GasolinePriceYenPerL float64 `json:"gasoline_price_yen_per_l"`
	GasolineCostYen      int64   `json:"gasoline_cost_yen"`
	HighwayCostYen       int64   `json:"highway_cost_yen"`
	RentalFeeYen         int64   `json:"rental_fee_yen"`
	FareYen              int64   `json:"fare_yen"`
}

type TripTransportRequest struct {
	TripTransportPayload
}

type TripTransportResponse struct {
	ID                   uint    `json:"id"`
	TripTransportPayload
}

type TripLodgingPayload struct {
	Date              string `json:"date"`
	Name              string `json:"name"`
	ReservationURL    string `json:"reservation_url"`
	Address           string `json:"address"`
	CheckIn           string `json:"check_in"`
	CheckOut          string `json:"check_out"`
	ReservationNumber string `json:"reservation_number"`
	CostYen           int64  `json:"cost_yen"`
}

type TripLodgingRequest struct {
	TripLodgingPayload
}

type TripLodgingResponse struct {
	ID                uint   `json:"id"`
	TripLodgingPayload
}

type TripBudgetItemPayload struct {
	Name    string `json:"name"`
	CostYen int64  `json:"cost_yen"`
}

type TripBudgetItemRequest struct {
	TripBudgetItemPayload
}

type TripBudgetItemResponse struct {
	ID      uint   `json:"id"`
	TripBudgetItemPayload
}

type TripBudgetResponse struct {
	TransportTotal int64                   `json:"transport_total"`
	LodgingTotal   int64                   `json:"lodging_total"`
	Total          int64                   `json:"total"`
	Items          []TripBudgetItemResponse `json:"items"`
}

func (h *TripHandler) CreateTrip(c echo.Context) error {
	userVal := c.Get("user")
	user, ok := userVal.(*model.User)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid user")
	}

	groupID, err := getGroupIDFromContext(c)
	if err != nil {
		return err
	}

	var req CreateTripRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	startAt, err := time.Parse("2006-01-02T15:04:05Z07:00", req.StartAt)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid start_at format")
	}

	endAt, err := time.Parse("2006-01-02T15:04:05Z07:00", req.EndAt)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid end_at format")
	}

	var notifyAt *time.Time
	if req.NotifyAt != nil {
		parsed, err := time.Parse("2006-01-02T15:04:05Z07:00", *req.NotifyAt)
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "invalid notify_at format")
		}
		notifyAt = &parsed
	}

	trip, err := h.tripUsecase.CreateTrip(req.Title, startAt, endAt, req.Note, user.ID, notifyAt, req.AlbumIDs, req.PostIDs, groupID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	var notifyAtStr *string
	if trip.NotifyAt != nil {
		str := trip.NotifyAt.Format("2006-01-02T15:04:05Z07:00")
		notifyAtStr = &str
	}

	return c.JSON(http.StatusCreated, TripResponse{
		ID:        trip.ID,
		Title:     trip.Title,
		StartAt:   trip.StartAt.Format("2006-01-02T15:04:05Z07:00"),
		EndAt:     trip.EndAt.Format("2006-01-02T15:04:05Z07:00"),
		Note:      trip.Note,
		CreatedBy: trip.CreatedBy,
		NotifyAt:  notifyAtStr,
		CreatedAt: trip.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}

func (h *TripHandler) GetAllTrips(c echo.Context) error {
	groupID, err := getGroupIDFromContext(c)
	if err != nil {
		return err
	}

	trips, err := h.tripUsecase.GetAllTrips(groupID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	response := make([]TripResponse, len(trips))
	for i, trip := range trips {
		var notifyAtStr *string
		if trip.NotifyAt != nil {
			str := trip.NotifyAt.Format("2006-01-02T15:04:05Z07:00")
			notifyAtStr = &str
		}

		response[i] = TripResponse{
			ID:        trip.ID,
			Title:     trip.Title,
			StartAt:   trip.StartAt.Format("2006-01-02T15:04:05Z07:00"),
			EndAt:     trip.EndAt.Format("2006-01-02T15:04:05Z07:00"),
			Note:      trip.Note,
			CreatedBy: trip.CreatedBy,
			NotifyAt:  notifyAtStr,
			CreatedAt: trip.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		}
	}

	return c.JSON(http.StatusOK, response)
}

func (h *TripHandler) GetTrip(c echo.Context) error {
	id, err := parseTripID(c)
	if err != nil {
		return err
	}

	groupID, err := getGroupIDFromContext(c)
	if err != nil {
		return err
	}

	trip, err := h.tripUsecase.GetTrip(uint(id), groupID)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "trip not found")
	}

	albums, posts, err := h.tripUsecase.GetTripRelations(trip.ID, groupID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, buildTripResponse(trip, albums, posts))
}

func (h *TripHandler) GetSchedule(c echo.Context) error {
	id, err := parseTripID(c)
	if err != nil {
		return err
	}

	groupID, err := getGroupIDFromContext(c)
	if err != nil {
		return err
	}

	items, err := h.tripUsecase.GetSchedule(uint(id), groupID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	response := make([]TripScheduleItemResponse, len(items))
	for i, item := range items {
		response[i] = TripScheduleItemResponse{
			ID: item.ID,
			TripScheduleItemPayload: TripScheduleItemPayload{
				Date:    item.Date,
				Time:    item.Time,
				Content: item.Content,
			},
		}
	}
	return c.JSON(http.StatusOK, response)
}

func (h *TripHandler) UpdateSchedule(c echo.Context) error {
	id, err := parseTripID(c)
	if err != nil {
		return err
	}

	groupID, err := getGroupIDFromContext(c)
	if err != nil {
		return err
	}

	var req []TripScheduleItemRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	items := make([]*model.TripScheduleItem, len(req))
	for i, item := range req {
		items[i] = &model.TripScheduleItem{
			TripID:  uint(id),
			Date:    item.Date,
			Time:    item.Time,
			Content: item.Content,
		}
	}

	if err := h.tripUsecase.UpdateSchedule(uint(id), items, groupID); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.NoContent(http.StatusNoContent)
}

func (h *TripHandler) GetTransports(c echo.Context) error {
	id, err := parseTripID(c)
	if err != nil {
		return err
	}

	groupID, err := getGroupIDFromContext(c)
	if err != nil {
		return err
	}

	transports, err := h.tripUsecase.GetTransports(uint(id), groupID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	response := make([]TripTransportResponse, len(transports))
	for i, transport := range transports {
		response[i] = TripTransportResponse{
			ID: transport.ID,
			TripTransportPayload: TripTransportPayload{
				Mode:                 transport.Mode,
				Date:                 transport.Date,
				FromLocation:         transport.FromLocation,
				ToLocation:           transport.ToLocation,
				Note:                 transport.Note,
				DepartureTime:        transport.DepartureTime,
				ArrivalTime:          transport.ArrivalTime,
				RouteName:            transport.RouteName,
				TrainName:            transport.TrainName,
				FerryName:            transport.FerryName,
				FlightNumber:         transport.FlightNumber,
				Airline:              transport.Airline,
				Terminal:             transport.Terminal,
				CompanyName:          transport.CompanyName,
				PickupLocation:       transport.PickupLocation,
				DropoffLocation:      transport.DropoffLocation,
				RentalURL:            transport.RentalURL,
				DistanceKm:           transport.DistanceKm,
				FuelEfficiencyKmPerL: transport.FuelEfficiencyKmPerL,
				GasolinePriceYenPerL: transport.GasolinePriceYenPerL,
				GasolineCostYen:      transport.GasolineCostYen,
				HighwayCostYen:       transport.HighwayCostYen,
				RentalFeeYen:         transport.RentalFeeYen,
				FareYen:              transport.FareYen,
			},
		}
	}
	return c.JSON(http.StatusOK, response)
}

func (h *TripHandler) UpdateTransports(c echo.Context) error {
	id, err := parseTripID(c)
	if err != nil {
		return err
	}

	groupID, err := getGroupIDFromContext(c)
	if err != nil {
		return err
	}

	var req []TripTransportRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	transports := make([]*model.TripTransport, len(req))
	for i, transport := range req {
		transports[i] = &model.TripTransport{
			TripID:               uint(id),
			Mode:                 transport.Mode,
			Date:                 transport.Date,
			FromLocation:         transport.FromLocation,
			ToLocation:           transport.ToLocation,
			Note:                 transport.Note,
			DepartureTime:        transport.DepartureTime,
			ArrivalTime:          transport.ArrivalTime,
			RouteName:            transport.RouteName,
			TrainName:            transport.TrainName,
			FerryName:            transport.FerryName,
			FlightNumber:         transport.FlightNumber,
			Airline:              transport.Airline,
			Terminal:             transport.Terminal,
			CompanyName:          transport.CompanyName,
			PickupLocation:       transport.PickupLocation,
			DropoffLocation:      transport.DropoffLocation,
			RentalURL:            transport.RentalURL,
			DistanceKm:           transport.DistanceKm,
			FuelEfficiencyKmPerL: transport.FuelEfficiencyKmPerL,
			GasolinePriceYenPerL: transport.GasolinePriceYenPerL,
			GasolineCostYen:      transport.GasolineCostYen,
			HighwayCostYen:       transport.HighwayCostYen,
			RentalFeeYen:         transport.RentalFeeYen,
			FareYen:              transport.FareYen,
		}
	}

	if err := h.tripUsecase.UpdateTransports(uint(id), transports, groupID); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.NoContent(http.StatusNoContent)
}

func (h *TripHandler) GetLodgings(c echo.Context) error {
	id, err := parseTripID(c)
	if err != nil {
		return err
	}

	groupID, err := getGroupIDFromContext(c)
	if err != nil {
		return err
	}

	lodgings, err := h.tripUsecase.GetLodgings(uint(id), groupID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	response := make([]TripLodgingResponse, len(lodgings))
	for i, lodging := range lodgings {
		response[i] = TripLodgingResponse{
			ID: lodging.ID,
			TripLodgingPayload: TripLodgingPayload{
				Date:              lodging.Date,
				Name:              lodging.Name,
				ReservationURL:    lodging.ReservationURL,
				Address:           lodging.Address,
				CheckIn:           lodging.CheckIn,
				CheckOut:          lodging.CheckOut,
				ReservationNumber: lodging.ReservationNumber,
				CostYen:           lodging.CostYen,
			},
		}
	}
	return c.JSON(http.StatusOK, response)
}

func (h *TripHandler) UpdateLodgings(c echo.Context) error {
	id, err := parseTripID(c)
	if err != nil {
		return err
	}

	groupID, err := getGroupIDFromContext(c)
	if err != nil {
		return err
	}

	var req []TripLodgingRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	lodgings := make([]*model.TripLodging, len(req))
	for i, lodging := range req {
		lodgings[i] = &model.TripLodging{
			TripID:            uint(id),
			Date:              lodging.Date,
			Name:              lodging.Name,
			ReservationURL:    lodging.ReservationURL,
			Address:           lodging.Address,
			CheckIn:           lodging.CheckIn,
			CheckOut:          lodging.CheckOut,
			ReservationNumber: lodging.ReservationNumber,
			CostYen:           lodging.CostYen,
		}
	}

	if err := h.tripUsecase.UpdateLodgings(uint(id), lodgings, groupID); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.NoContent(http.StatusNoContent)
}

func (h *TripHandler) GetBudget(c echo.Context) error {
	id, err := parseTripID(c)
	if err != nil {
		return err
	}

	groupID, err := getGroupIDFromContext(c)
	if err != nil {
		return err
	}

	items, transportTotal, lodgingTotal, total, err := h.tripUsecase.GetBudget(uint(id), groupID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	responseItems := make([]TripBudgetItemResponse, len(items))
	for i, item := range items {
		responseItems[i] = TripBudgetItemResponse{
			ID: item.ID,
			TripBudgetItemPayload: TripBudgetItemPayload{
				Name:    item.Name,
				CostYen: item.CostYen,
			},
		}
	}

	return c.JSON(http.StatusOK, TripBudgetResponse{
		TransportTotal: transportTotal,
		LodgingTotal:   lodgingTotal,
		Total:          total,
		Items:          responseItems,
	})
}

func (h *TripHandler) UpdateBudget(c echo.Context) error {
	id, err := parseTripID(c)
	if err != nil {
		return err
	}

	groupID, err := getGroupIDFromContext(c)
	if err != nil {
		return err
	}

	var req []TripBudgetItemRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	items := make([]*model.TripBudgetItem, len(req))
	for i, item := range req {
		items[i] = &model.TripBudgetItem{
			TripID:  uint(id),
			Name:    item.Name,
			CostYen: item.CostYen,
		}
	}

	if err := h.tripUsecase.UpdateBudget(uint(id), items, groupID); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.NoContent(http.StatusNoContent)
}

func (h *TripHandler) DeleteTrip(c echo.Context) error {
	id, err := parseTripID(c)
	if err != nil {
		return err
	}

	groupID, err := getGroupIDFromContext(c)
	if err != nil {
		return err
	}

	if err := h.tripUsecase.DeleteTrip(uint(id), groupID); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.NoContent(http.StatusNoContent)
}

func (h *TripHandler) UpdateTrip(c echo.Context) error {
	id, err := parseTripID(c)
	if err != nil {
		return err
	}

	groupID, err := getGroupIDFromContext(c)
	if err != nil {
		return err
	}

	var req UpdateTripRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

 	startAt, err := time.Parse(time.RFC3339, req.StartAt)
 	if err != nil {
 		return echo.NewHTTPError(http.StatusBadRequest, "invalid start_at format")
 	}


 	endAt, err := time.Parse(time.RFC3339, req.EndAt)
 	if err != nil {
 		return echo.NewHTTPError(http.StatusBadRequest, "invalid end_at format")
 	}


	var notifyAt *time.Time
	if req.NotifyAt != nil {
		parsed, err := time.Parse("2006-01-02T15:04:05Z07:00", *req.NotifyAt)
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "invalid notify_at format")
		}
		notifyAt = &parsed
	}

	trip, err := h.tripUsecase.UpdateTrip(uint(id), req.Title, startAt, endAt, req.Note, notifyAt, groupID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	albums, posts, err := h.tripUsecase.GetTripRelations(trip.ID, groupID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, buildTripResponse(trip, albums, posts))
}

func buildTripResponse(trip *model.Trip, albums []*model.Album, posts []*model.Post) TripResponse {
	var notifyAtStr *string
	if trip.NotifyAt != nil {
		str := trip.NotifyAt.Format("2006-01-02T15:04:05Z07:00")
		notifyAtStr = &str
	}

	albumResponses := make([]TripAlbumResponse, len(albums))
	for i, album := range albums {
		albumResponses[i] = TripAlbumResponse{
			ID:          album.ID,
			Title:       album.Title,
			Description: album.Description,
		}
	}
	postResponses := make([]TripPostResponse, len(posts))
	for i, post := range posts {
		postResponses[i] = TripPostResponse{
			ID:          post.ID,
			Type:        post.Type,
			Title:       post.Title,
			Body:        post.Body,
			PublishedAt: post.PublishedAt.Format("2006-01-02T15:04:05Z07:00"),
		}
	}

	return TripResponse{
		ID:        trip.ID,
		Title:     trip.Title,
		StartAt:   trip.StartAt.Format("2006-01-02T15:04:05Z07:00"),
		EndAt:     trip.EndAt.Format("2006-01-02T15:04:05Z07:00"),
		Note:      trip.Note,
		CreatedBy: trip.CreatedBy,
		NotifyAt:  notifyAtStr,
		CreatedAt: trip.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		Albums:    albumResponses,
		Posts:     postResponses,
	}
}

func parseTripID(c echo.Context) (uint, error) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return 0, echo.NewHTTPError(http.StatusBadRequest, "invalid trip ID")
	}
	return uint(id), nil
}
