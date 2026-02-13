package auth

import (
	"context"
	"encoding/json"
	"errors"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/option"
)

type FirebaseAuth struct {
	client      *auth.Client
	tokenSource oauth2.TokenSource
}

func NewFirebaseAuth(projectID, clientEmail, privateKey string) (*FirebaseAuth, error) {
	ctx := context.Background()

	// Create service account credentials
	credentials := map[string]string{
		"type":         "service_account",
		"project_id":   projectID,
		"private_key":  privateKey,
		"client_email": clientEmail,
		"token_uri":    "https://oauth2.googleapis.com/token",
	}

	credJSON, err := json.Marshal(credentials)
	if err != nil {
		return nil, err
	}

	creds, err := google.CredentialsFromJSON(
		ctx,
		credJSON,
		"https://www.googleapis.com/auth/identitytoolkit",
		"https://www.googleapis.com/auth/cloud-platform",
	)
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

	return &FirebaseAuth{client: client, tokenSource: creds.TokenSource}, nil
}

func (f *FirebaseAuth) VerifyIDToken(ctx context.Context, idToken string) (*auth.Token, error) {
	return f.client.VerifyIDToken(ctx, idToken)
}

func (f *FirebaseAuth) VerifySessionCookie(ctx context.Context, sessionCookie string) (*auth.Token, error) {
	return f.client.VerifySessionCookie(ctx, sessionCookie)
}

func (f *FirebaseAuth) GetAccessToken(ctx context.Context) (string, error) {
	if f.tokenSource == nil {
		return "", errors.New("token source is not configured")
	}
	token, err := f.tokenSource.Token()
	if err != nil {
		return "", err
	}
	return token.AccessToken, nil
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
