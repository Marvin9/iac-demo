resource "aws_s3_bucket_ownership_controls" "test" {
  bucket = aws_s3_bucket.test.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "test" {
  bucket     = aws_s3_bucket.test.id
  acl        = "private"
  depends_on = [aws_s3_bucket_ownership_controls.test]
}

resource "aws_s3_bucket_public_access_block" "test" {
  bucket              = aws_s3_bucket.test.id
  block_public_policy = false
  depends_on          = [aws_s3_bucket_acl.test]
}

resource "aws_s3_bucket_policy" "test" {
  bucket = aws_s3_bucket.test.id
  policy = jsonencode({
    Version : "2012-10-17",
    Statement : [
      {
        Effect : "Allow",
        Principal : "*",
        Action : "s3:*",
        Resource : ["${aws_s3_bucket.test.arn}", "${aws_s3_bucket.test.arn}/*"]
      }
    ]
  })
  depends_on = [aws_s3_bucket_public_access_block.test]
}
