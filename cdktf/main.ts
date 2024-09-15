import { Construct } from "constructs";
import * as fs from "fs";
import { resolve } from "path";
import { App, S3Backend, TerraformOutput, TerraformStack } from "cdktf";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { S3Bucket } from "@cdktf/provider-aws/lib/s3-bucket";
import { S3BucketWebsiteConfiguration } from "@cdktf/provider-aws/lib/s3-bucket-website-configuration";
import { bucketConfig } from "./bucket-config";
import { S3Object } from "@cdktf/provider-aws/lib/s3-object";

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new AwsProvider(this, "provider", {
      region: "us-east-1",
    });

    new S3Backend(this, {
      bucket: "goldberg-cdktf-test",
      key: "infra",
      region: "us-east-1",
    });

    const s3Bucket = new S3Bucket(this, "bucket", {
      bucket: "cdktf-web-dalhousie",
    });

    const webConfig = new S3BucketWebsiteConfiguration(this, "web-config", {
      bucket: s3Bucket.id,
      indexDocument: {
        suffix: "index.html",
      },
    });

    const conf = bucketConfig(this, s3Bucket);

    for (const file of fs.readdirSync("../web")) {
      const path = `../web/${file}`;

      new S3Object(this, `test-${path}`, {
        bucket: s3Bucket.id,
        dependsOn: [webConfig, conf],
        key: file,
        acl: "public-read",
        source: resolve(process.cwd(), path),
        etag: `${Date.now()}`,
        contentType: "text/html",
        cacheControl: "no-cache",
      });
    }

    new TerraformOutput(this, "op", {
      value: `http://${webConfig.websiteEndpoint}`,
    });
  }
}

const app = new App();
new MyStack(app, "cdktf");
app.synth();
