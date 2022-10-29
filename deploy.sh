#!/usr/bin/env bash

sam deploy \
    --region eu-west-3 \
    --template-file test-stack.yml \
    --no-fail-on-empty-changeset \
    --stack-name autofill-delete-test-stack \
    --capabilities CAPABILITY_NAMED_IAM
