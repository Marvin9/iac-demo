import { S3Bucket } from "@cdktf/provider-aws/lib/s3-bucket";
import { S3BucketAcl } from "@cdktf/provider-aws/lib/s3-bucket-acl";
import { S3BucketOwnershipControls } from "@cdktf/provider-aws/lib/s3-bucket-ownership-controls";
import { S3BucketPolicy } from "@cdktf/provider-aws/lib/s3-bucket-policy";
import { S3BucketPublicAccessBlock } from "@cdktf/provider-aws/lib/s3-bucket-public-access-block";
import { Construct } from "constructs";

export const bucketConfig = (scope: Construct, bucket: S3Bucket) => {
  const ownershipControl = new S3BucketOwnershipControls(
    scope,
    "ownership-control",
    {
      bucket: bucket.id,
      rule: {
        objectOwnership: "BucketOwnerPreferred",
      },
    }
  );

  const acl = new S3BucketAcl(scope, "acl", {
    bucket: bucket.id,
    acl: "private",
    dependsOn: [ownershipControl],
  });

  const blockPublicAccess = new S3BucketPublicAccessBlock(
    scope,
    "access-block",
    {
      bucket: bucket.id,
      blockPublicPolicy: false,
      dependsOn: [acl],
    }
  );

  return new S3BucketPolicy(scope, "policy", {
    bucket: bucket.id,
    policy: JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: "*",
          Action: "s3:*",
          Resource: [`${bucket.arn}`, `${bucket.arn}/*`],
        },
      ],
    }),
    dependsOn: [blockPublicAccess],
  });
};
