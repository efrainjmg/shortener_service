variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "table_name" {
  description = "DynamoDB table name"
  type        = string
  default     = "shortener_table"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}
