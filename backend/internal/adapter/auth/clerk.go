package auth

import (
	"context"

	clerk "github.com/clerk/clerk-sdk-go/v2"
	"github.com/clerk/clerk-sdk-go/v2/jwks"
	clerkjwt "github.com/clerk/clerk-sdk-go/v2/jwt"
	clerkuser "github.com/clerk/clerk-sdk-go/v2/user"
)

type ClerkUser struct {
	ID          string
	Email       string
	DisplayName string
}

type ClerkAuth struct {
	jwksClient *jwks.Client
	userClient *clerkuser.Client
}

func NewClerkAuth(secretKey string) (*ClerkAuth, error) {
	if secretKey == "" {
		return nil, nil
	}
	config := &clerk.ClientConfig{BackendConfig: clerk.BackendConfig{Key: clerk.String(secretKey)}}
	return &ClerkAuth{
		jwksClient: jwks.NewClient(config),
		userClient: clerkuser.NewClient(config),
	}, nil
}

func (a *ClerkAuth) VerifyToken(ctx context.Context, token string) (*ClerkUser, error) {
	claims, err := clerkjwt.Verify(ctx, &clerkjwt.VerifyParams{Token: token, JWKSClient: a.jwksClient})
	if err != nil {
		return nil, err
	}
	user, err := a.userClient.Get(ctx, claims.Subject)
	if err != nil {
		return nil, err
	}
	email := ""
	if user.PrimaryEmailAddressID != nil {
		for _, address := range user.EmailAddresses {
			if address.ID == *user.PrimaryEmailAddressID {
				email = address.EmailAddress
				break
			}
		}
	}
	displayName := ""
	if user.FirstName != nil {
		displayName = *user.FirstName
	}
	if user.LastName != nil && *user.LastName != "" {
		if displayName != "" {
			displayName += " "
		}
		displayName += *user.LastName
	}
	return &ClerkUser{ID: user.ID, Email: email, DisplayName: displayName}, nil
}
