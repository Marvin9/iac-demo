import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as fs from "fs";

import { bucketConfig } from "./bucket-config";

const bucket = new aws.s3.BucketV2("pulumi-iac", {
  bucket: "pulumi-web-dalhousie",
});

const config = bucketConfig(bucket);

for (const file of fs.readdirSync("../web")) {
  const path = `../web/${file}`;

  const asset = new pulumi.asset.FileAsset(path);

  new aws.s3.BucketObjectv2(
    file,
    {
      bucket: bucket.id,
      key: file,
      acl: "public-read",
      source: asset,
      contentType: "text/html",
    },
    { dependsOn: [...config] }
  );
}

export const bucketUrl = config[0].websiteEndpoint.apply(
  (value) => `http://${value}`
);
