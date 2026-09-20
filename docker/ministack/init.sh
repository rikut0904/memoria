#!/bin/sh
set -eu

endpoint="${AWS_ENDPOINT_URL:-http://localhost:4566}"

if ! aws --endpoint-url "$endpoint" s3api head-bucket --bucket memoria-local >/dev/null 2>&1; then
	aws --endpoint-url "$endpoint" s3 mb s3://memoria-local
fi

aws --endpoint-url "$endpoint" ses verify-email-identity --email-address no-reply@memoria.local
