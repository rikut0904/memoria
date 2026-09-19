#!/bin/sh
set -eu
if ! awslocal s3api head-bucket --bucket memoria-local >/dev/null 2>&1; then
	awslocal s3 mb s3://memoria-local
fi
awslocal ses verify-email-identity --email-address no-reply@memoria.local
