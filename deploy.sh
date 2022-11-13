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

STACK_OUTPUT=$(
    aws cloudformation describe-stacks \
        --region eu-west-3 \
        --stack-name autofill-delete-test-stack \
        --query "Stacks|[0].Outputs" \
        --output text
)
USERPOOL_ID=$(echo "$STACK_OUTPUT" | grep "UserPoolId" | cut -f2)
BUCKET=$(echo "$STACK_OUTPUT" | grep "Bucket" | cut -f2)

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

aws cognito-idp admin-disable-user \
    --region eu-west-3 \
    --user-pool-id $USERPOOL_ID \
    --username autofill-delete-test-user

IAM_SERVICE_CREDS=$(aws iam list-service-specific-credentials --user-name autofill-delete-test-user)
IAM_CREDS_CODE_COMMIT=$(echo $IAM_SERVICE_CREDS | jq ".ServiceSpecificCredentials | any(.ServiceName==\"codecommit.amazonaws.com\")")
IAM_CREDS_KEYSPACES=$(echo $IAM_SERVICE_CREDS | jq ".ServiceSpecificCredentials | any(.ServiceName==\"cassandra.amazonaws.com\")")

if [ "$IAM_CREDS_CODE_COMMIT" == "false" ]; then
    aws iam create-service-specific-credential \
        --user-name autofill-delete-test-user \
        --service-name codecommit.amazonaws.com \
        --query "ServiceSpecificCredential.ServiceSpecificCredentialId" \
        --output text \
    | xargs -I {} aws iam update-service-specific-credential \
        --user-name autofill-delete-test-user \
        --service-specific-credential-id {} \
        --status Inactive
fi

if [ "$IAM_CREDS_KEYSPACES" == "false" ]; then
    aws iam create-service-specific-credential \
        --user-name autofill-delete-test-user \
        --service-name cassandra.amazonaws.com \
        --query "ServiceSpecificCredential.ServiceSpecificCredentialId" \
        --output text \
    | xargs -I {} aws iam update-service-specific-credential \
        --user-name autofill-delete-test-user \
        --service-specific-credential-id {} \
        --status Inactive
fi

aws s3 cp README.md s3://$BUCKET
