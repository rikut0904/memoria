#!/bin/sh
set -eu
awslocal s3 mb s3://memoria-local
awslocal ses verify-email-identity --email-address no-reply@memoria.local
