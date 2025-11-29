output "dynamodb_table_name" {
  description = "Name of the DynamoDB table"
  value       = aws_dynamodb_table.shortener_table.name
}

output "dynamodb_table_arn" {
  description = "ARN of the DynamoDB table"
  value       = aws_dynamodb_table.shortener_table.arn
}
