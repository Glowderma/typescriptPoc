import request from 'supertest';
import axios from 'axios';
import app from './index.js';  // Adjust the import path if necessary

describe('GET /auth', () => {
  it('should return an access token', async () => {
    const mockResponse = { data: { access_token: 'mock_access_token' } };
    jest.spyOn(axios, 'post').mockResolvedValue(mockResponse);

    const response = await request(app).get('/auth');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('access_token', 'mock_access_token');
  });

  it('should return an error if Auth0 request fails', async () => {
    jest.spyOn(axios, 'post').mockRejectedValue({ response: { status: 401, data: 'Unauthorized' } });

    const response = await request(app).get('/auth');
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'Unauthorized');
  });
});
