import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const saveUrl = async (shortCode, originalUrl) => {
    const command = new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: {
            id: shortCode,
            originalUrl: originalUrl,
            createdAt: new Date().toISOString(),
        },
    });

    await docClient.send(command);
    return shortCode;
};
