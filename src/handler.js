import { saveUrl } from './services/dynamoService.js';
import { generateShortCode } from './utils/codeGenerator.js';
import { isValidUrl } from './utils/urlValidator.js';

export const handler = async (event) => {
    try {
        if (!event.body) {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": true,
                },
                body: JSON.stringify({ error: 'Request body is missing' }),
            };
        }

        const body = JSON.parse(event.body);
        const { url } = body;

        if (!url) {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": true,
                },
                body: JSON.stringify({ error: 'URL is required' }),
            };
        }

        if (!isValidUrl(url)) {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": true,
                },
                body: JSON.stringify({ error: 'Invalid URL format' }),
            };
        }

        const shortCode = generateShortCode();
        await saveUrl(shortCode, url);

        const host = event.headers && (event.headers.Host || event.headers.host);
        const baseUrl = host ? `https://${host}` : 'https://example.com';
        const shortUrl = `${baseUrl}/${shortCode}`;

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({
                shortUrl,
            }),
        };
    } catch (error) {
        console.error('Error processing request:', error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};
