import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

export const bucketConfig = (bucket: aws.s3.BucketV2) => {
  const webConfig = new aws.s3.BucketWebsiteConfigurationV2(
    "pulumi-iac-website",
    {
      bucket: bucket.id,
      indexDocument: {
        suffix: "index.html",
      },
    }
  );

  const ownershipControl = new aws.s3.BucketOwnershipControls(
    "pulumi-iac-ownership",
    {
      bucket: bucket.id,
      rule: {
        objectOwnership: "BucketOwnerPreferred",
      },
    }
  );

  const acl = new aws.s3.BucketAclV2(
    "pulumi-iac-acl",
    {
      bucket: bucket.id,
      acl: aws.s3.PrivateAcl,
    },
    {
      dependsOn: [ownershipControl],
    }
  );

  const policyAllow = new aws.s3.BucketPublicAccessBlock(
    "pulumi-iac-public-access",
    {
      bucket: bucket.id,
      blockPublicPolicy: false,
    },
    {
      dependsOn: [acl],
    }
  );

  const policy = new aws.s3.BucketPolicy(
    "pulumi-iac-policy",
    {
      bucket: bucket.id,
      policy: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: "*",
            Action: "s3:*",
            Resource: [bucket.arn, pulumi.interpolate`${bucket.arn}/*`],
          },
        ],
      },
    },
    { dependsOn: [policyAllow] }
  );

  return [webConfig, policy] as const;
};
