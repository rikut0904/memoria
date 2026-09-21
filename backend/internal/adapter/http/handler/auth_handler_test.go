package handler

import (
	"encoding/json"
	"strings"
	"testing"
)

func TestAuthResponseOmitsCredentialsWhenLocalStorageAuthIsDisabled(t *testing.T) {
	response, err := json.Marshal(newAuthResponse(1, "user@example.com", "User", "user", "session-cookie", "refresh-token", "id-token", false))
	if err != nil {
		t.Fatalf("marshal auth response: %v", err)
	}

	for _, field := range []string{"token", "refresh_token", "id_token"} {
		if strings.Contains(string(response), `"`+field+`"`) {
			t.Errorf("response contains credential field %q: %s", field, response)
		}
	}
}

func TestAuthResponseIncludesLocalCredentialsWhenEnabled(t *testing.T) {
	response, err := json.Marshal(newAuthResponse(1, "user@example.com", "User", "user", "session-cookie", "refresh-token", "id-token", true))
	if err != nil {
		t.Fatalf("marshal auth response: %v", err)
	}

	for _, field := range []string{"token", "refresh_token", "id_token"} {
		if !strings.Contains(string(response), `"`+field+`"`) {
			t.Errorf("response is missing credential field %q: %s", field, response)
		}
	}
}

func TestRefreshResponseOmitsCredentialsWhenLocalStorageAuthIsDisabled(t *testing.T) {
	response, err := json.Marshal(newRefreshResponse("session-cookie", "refresh-token", "id-token", false))
	if err != nil {
		t.Fatalf("marshal refresh response: %v", err)
	}

	if string(response) != "{}" {
		t.Fatalf("expected an empty refresh response, got %s", response)
	}
}
