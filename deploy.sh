#!/usr/bin/env bash

# DEFAULT_VPC_ID=$(
#     aws ec2 describe-vpcs \
#         --region eu-west-3 \
#         --query "Vpcs[?IsDefault].VpcId|[0]" \
#         --output text
# )

# DEFAULT_SUBNET_ID=$(
#     aws ec2 describe-subnets \
#         --region eu-west-3 \
#         --query "Subnets[?VpcId == '$DEFAULT_VPC_ID' && DefaultForAz].SubnetId|[0]" \
#         --output text
# )

sam deploy \
    --region eu-west-3 \
    --template-file test-stack.yml \
    --no-fail-on-empty-changeset \
    --stack-name autofill-delete-test-stack \
    --capabilities CAPABILITY_NAMED_IAM
    # --parameter-overrides "\
    #     ParameterKey=DefaultVpcId,ParameterValue=$DEFAULT_VPC_ID \
    #     ParameterKey=DefaultSubnetId,ParameterValue=$DEFAULT_SUBNET_ID"

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
