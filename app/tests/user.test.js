const request = require('supertest');
const app = require('../../app');

// Test user registration
describe('POST /api/register', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({
        fullname: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toEqual('success');
    expect(res.body.data).toHaveProperty('user');
  });

  it('should return 400 if email already exists', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({
        fullname: 'Jane Doe',
        email: 'john.doe@example.com', // Use the same email as previous test
        password: 'password456',
      });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('Email Already Exists');
  });
});

// Test user login
describe('POST /api/login', () => {
  it('should log in a user with correct credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        email: 'john.doe@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('access_token');
  });

  it('should return 400 on invalid password', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        email: 'john.doe@example.com',
        password: 'wrongpassword',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('Invalid password');
  });
});

// Test authenticated route access
describe('GET /api/profile', () => {
  let token;

  beforeAll(async () => {
    // Login user and get JWT token
    const loginRes = await request(app)
      .post('/api/login')
      .send({
        email: 'john.doe@example.com',
        password: 'password123',
      });

    token = loginRes.body.access_token;
  });

  it('should access profile with valid token', async () => {
    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('profile');
  });

  it('should return 401 without token', async () => {
    const res = await request(app)
      .get('/api/profile');

    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toEqual('Access denied, no token provided');
  });

  it('should return 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer invalidtoken`);

    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toEqual('Invalid token');
  });
});
