package email

import (
	"fmt"
	"html"
	"os"
	"strings"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ses"
)

type SESMailer struct {
	client       *ses.SES
	from         string
	baseURL      string
	textTemplate string
}

func NewSESMailer(region, accessKey, secretKey, fromEmail, baseURL, inviteTemplatePath string) (*SESMailer, error) {
	if fromEmail == "" {
		return nil, fmt.Errorf("SES_FROM_EMAIL is required")
	}
	if baseURL == "" {
		return nil, fmt.Errorf("FRONTEND_BASE_URL is required")
	}

	cfg := &aws.Config{
		Region:      aws.String(region),
		Credentials: credentials.NewStaticCredentials(accessKey, secretKey, ""),
	}

	sess, err := session.NewSession(cfg)
	if err != nil {
		return nil, err
	}

	var textTemplate string
	if inviteTemplatePath != "" {
		templateBytes, err := os.ReadFile(inviteTemplatePath)
		if err != nil {
			return nil, err
		}
		textTemplate = strings.TrimSpace(string(templateBytes))
	}

	return &SESMailer{
		client:       ses.New(sess),
		from:         fromEmail,
		baseURL:      strings.TrimRight(baseURL, "/"),
		textTemplate: textTemplate,
	}, nil
}

func (m *SESMailer) SendGroupInvite(email, role, token, groupName string, isExisting bool) error {
	inviteURL := fmt.Sprintf("%s/invites/%s", m.baseURL, token)
	roleLabel := "通常メンバー"
	if role == "manager" {
		roleLabel = "グループ管理者"
	}

	subject := "Memoria グループ招待のお知らせ"
	textBody := m.defaultGroupInviteBody(inviteURL, roleLabel, groupName, isExisting)
	if m.textTemplate != "" {
		textBody = applyTemplate(m.textTemplate, inviteURL, roleLabel, email, groupName, isExisting)
	}
	htmlBody := textToHTML(textBody)

	input := &ses.SendEmailInput{
		Source: aws.String(m.from),
		Destination: &ses.Destination{
			ToAddresses: []*string{aws.String(email)},
		},
		Message: &ses.Message{
			Subject: &ses.Content{
				Data:    aws.String(subject),
				Charset: aws.String("UTF-8"),
			},
			Body: &ses.Body{
				Text: &ses.Content{
					Data:    aws.String(textBody),
					Charset: aws.String("UTF-8"),
				},
				Html: &ses.Content{
					Data:    aws.String(htmlBody),
					Charset: aws.String("UTF-8"),
				},
			},
		},
	}

	_, err := m.client.SendEmail(input)
	return err
}

func (m *SESMailer) defaultGroupInviteBody(inviteURL, roleLabel, groupName string, isExisting bool) string {
	var firstLine string
	if isExisting {
		firstLine = "既存アカウントへのグループ追加の確認依頼です。"
	} else {
		firstLine = "新規アカウント登録後にグループへ参加できます。"
	}
	return fmt.Sprintf(
		"%s\n\nグループ名: %s\n招待リンク: %s\n権限: %s\n\nこのメールに心当たりがない場合は破棄してください。",
		firstLine,
		groupName,
		inviteURL,
		roleLabel,
	)
}

func applyTemplate(templateText, inviteURL, roleLabel, email, groupName string, isExisting bool) string {
	inviteType := "new"
	if isExisting {
		inviteType = "existing"
	}
	replacer := strings.NewReplacer(
		"{{INVITE_URL}}", inviteURL,
		"{{ROLE}}", roleLabel,
		"{{EMAIL}}", email,
		"{{GROUP_NAME}}", groupName,
		"{{INVITE_TYPE}}", inviteType,
	)
	return replacer.Replace(templateText)
}

func textToHTML(text string) string {
	escaped := html.EscapeString(text)
	escaped = strings.ReplaceAll(escaped, "\n", "<br>")
	return "<pre style=\"font-family: inherit;\">" + escaped + "</pre>"
}
