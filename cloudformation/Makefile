STACK_NAME := "goldberg-cloudformation-stack"
BUCKET_NAME := "cloudformation-web-dalhousie"

.PHONY: populate-web
populate-web:
	aws s3 cp ../web/index.html s3://${BUCKET_NAME}/index.html

.PHONY: create-stack
create-stack:
	aws cloudformation create-stack --stack-name ${STACK_NAME} --template-body file://${PWD}/site.yaml

.PHONY: empty-bucket
empty-bucket:
	aws s3 rm s3://${BUCKET_NAME} --recursive

.PHONY: delete-stack
delete-stack: empty-bucket
	aws cloudformation delete-stack --stack-name ${STACK_NAME}

.PHONY: describe-stack
describe-stack:
	aws cloudformation describe-stacks --stack-name ${STACK_NAME}