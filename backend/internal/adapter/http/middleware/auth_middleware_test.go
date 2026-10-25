package middleware

import (
	"testing"

	fbauth "firebase.google.com/go/v4/auth"
)

func TestIsVerifiedEmailToken(t *testing.T) {
	tests := []struct {
		name     string
		claims   map[string]interface{}
		verified bool
	}{
		{name: "verified", claims: map[string]interface{}{"email_verified": true}, verified: true},
		{name: "unverified", claims: map[string]interface{}{"email_verified": false}},
		{name: "missing claim", claims: map[string]interface{}{}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := isVerifiedEmailToken(&fbauth.Token{Claims: tt.claims}); got != tt.verified {
				t.Fatalf("isVerifiedEmailToken() = %v, want %v", got, tt.verified)
			}
		})
	}
}
