resource "aws_s3_bucket" "test" {
  bucket = "terraform-web-dalhousie"
}

resource "aws_s3_bucket_website_configuration" "test" {
  bucket = aws_s3_bucket.test.id
  index_document {
    suffix = "index.html"
  }
}

resource "aws_s3_object" "test" {
  for_each = fileset(path.cwd, "../web/*.html")

  bucket       = aws_s3_bucket.test.id
  key          = basename(each.value)
  acl          = "public-read"
  source       = each.value
  etag         = filemd5(each.value)
  content_type = "text/html"

  depends_on = [aws_s3_bucket_website_configuration.test, aws_s3_bucket_policy.test]
}

output "website" {
  value = "http://${aws_s3_bucket_website_configuration.test.website_endpoint}"
}
