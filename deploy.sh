#!/usr/bin/env bash

sam deploy \
    --region eu-west-3 \
    --template-file test-stack.yml \
    --no-fail-on-empty-changeset \
    --stack-name autofill-delete-test-stack \
    --capabilities CAPABILITY_NAMED_IAM

BACKUP_NUMBER=$(
    aws dynamodb list-backups \
        --region eu-west-3 \
        --table-name autofill-delete-test-table \
        --query "length(BackupSummaries)"
)

if [ $BACKUP_NUMBER -eq 0 ]; then
    aws dynamodb create-backup \
        --region eu-west-3 \
        --table-name autofill-delete-test-table \
        --backup-name autofill-delete-test-backup
fi
