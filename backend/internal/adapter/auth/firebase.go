package auth

import (
	"context"
	"encoding/json"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

type FirebaseAuth struct {
	client *auth.Client
}

func NewFirebaseAuth(projectID, clientEmail, privateKey string) (*FirebaseAuth, error) {
	ctx := context.Background()

	// Create service account credentials
	credentials := map[string]string{
		"type":                        "service_account",
		"project_id":                  projectID,
		"private_key":                 privateKey,
		"client_email":                clientEmail,
		"token_uri":                   "https://oauth2.googleapis.com/token",
	}

	credJSON, err := json.Marshal(credentials)
	if err != nil {
		return nil, err
	}

	opt := option.WithCredentialsJSON(credJSON)
	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		return nil, err
	}

	client, err := app.Auth(ctx)
	if err != nil {
		return nil, err
	}

	return &FirebaseAuth{client: client}, nil
}

func (f *FirebaseAuth) VerifyIDToken(ctx context.Context, idToken string) (*auth.Token, error) {
	return f.client.VerifyIDToken(ctx, idToken)
}

func (f *FirebaseAuth) CreateUser(ctx context.Context, params *auth.UserToCreate) (*auth.UserRecord, error) {
	return f.client.CreateUser(ctx, params)
}

func (f *FirebaseAuth) DeleteUser(ctx context.Context, uid string) error {
	return f.client.DeleteUser(ctx, uid)
}

func (f *FirebaseAuth) GetClient() *auth.Client {
	return f.client
}
