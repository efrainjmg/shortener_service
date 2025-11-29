import { jest } from '@jest/globals';

// Mock dependencies
jest.unstable_mockModule('../src/services/dynamoService.js', () => ({
    saveUrl: jest.fn().mockResolvedValue('123456'),
}));

jest.unstable_mockModule('../src/utils/codeGenerator.js', () => ({
    generateShortCode: jest.fn().mockReturnValue('123456'),
}));

const { handler } = await import('../src/handler.js');

describe('Lambda Handler', () => {
    it('should return 200 and shortUrl for valid URL', async () => {
        const event = {
            body: JSON.stringify({ url: 'https://example.com' }),
            headers: { Host: 'api.example.com' }
        };

        const response = await handler(event);

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('shortUrl');
        expect(body.shortUrl).toBe('https://api.example.com/123456');
    });

    it('should return 400 for invalid URL', async () => {
        const event = {
            body: JSON.stringify({ url: 'not-a-url' }),
        };

        const response = await handler(event);

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('error', 'Invalid URL format');
    });

    it('should return 400 for missing URL', async () => {
        const event = {
            body: JSON.stringify({}),
        };

        const response = await handler(event);

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('error', 'URL is required');
    });
});
