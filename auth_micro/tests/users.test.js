const request = require('supertest');
const app = require('../app'); // Expressアプリケーションをインポート

describe('POST /users/register', () => {
  it('should create a new user and return 201 status', async () => {
    const res = await request(app)
      .post('/users/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'User created');
  });
});