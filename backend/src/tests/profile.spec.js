const express = require('express');
const request = require('supertest');
const profileRouter = require('../controllers/profile');
const auth = require('../controllers/auth');
const db = require('../models/db');
const cookieParser = require('cookie-parser');

describe('Auth and Profile API', () => {
  let app;
  const sessionKey = 'test-session-key';

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());


    auth.sessionUser[sessionKey] = { username: 'testuser' };

    app.use('/',auth.router);
    app.use('/',profileRouter);
  });

  afterEach(() => {
    jasmine.getEnv().allowRespy(true);
    delete auth.sessionUser[sessionKey];
  });

  describe('POST /register', () => {
    it('should register a new user', (done) => {
      const userData = {
        username: 'testuser',
        password: 'password',
        email: 'test@example.com',
        dob: '2000-01-01',
        phone: '1234567890',
        zipcode: '12345',
      };
    
      spyOn(db.User, 'findOne').and.returnValue(Promise.resolve(null));
      spyOn(db.User.prototype, 'save').and.returnValue(Promise.resolve());  
      spyOn(db.Profile.prototype, 'save').and.returnValue(Promise.resolve());
    
      request(app)
        .post('/register')
        .send(userData)
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
          expect(res.body.result).toBe('success');
          expect(res.body.username).toBe('testuser');
          expect(db.User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
          expect(db.User.prototype.save).toHaveBeenCalled();
          expect(db.Profile.prototype.save).toHaveBeenCalled();
          done();
        });
    });

    it('should return 400 if username already exists', (done) => {
      const userData = {
        username: 'testuser',
        password: 'password',
        email: 'test@example.com',
        dob: '2000-01-01',
        phone: '1234567890',
        zipcode: '12345',
      };

      const mockUserFindOne = {
        exec: jasmine.createSpy('exec').and.returnValue(Promise.resolve({ username: 'testuser' })),
      };
      spyOn(db.User, 'findOne').and.returnValue(mockUserFindOne);

      request(app)
        .post('/register')
        .send(userData)
        .end((err, res) => {
          expect(res.statusCode).toBe(400);
          expect(res.body.error).toBe('Username already exists');
          expect(db.User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
          done();
        });
    });
  });

  describe('POST /login', () => {
    it('should log in a user with correct credentials', (done) => {
      const userData = {
        username: 'testuser',
        password: 'password',
      };

      const userInDb = {
        username: 'testuser',
        salt: 'random-salt',
        hash: 'cc9250ce4e6c001f6508714a39516be8',
      };

      spyOn(db.User, 'findOne').and.returnValue(Promise.resolve(userInDb));

      request(app)
        .post('/login')
        .send(userData)
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
          expect(res.body.username).toBe('testuser');
          expect(res.body.message).toBe('Login successful');
          expect(res.headers['set-cookie']).toBeDefined();
          expect(db.User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
          done();
        });
    });

    it('should return 401 if username does not exist', (done) => {
      const userData = {
        username: 'nonexistentuser',
        password: 'password',
      };

      const mockUserFindOne = {
        exec: jasmine.createSpy('exec').and.returnValue(Promise.resolve(null)),
      };
      spyOn(db.User, 'findOne').and.returnValue(mockUserFindOne);

      request(app)
        .post('/login')
        .send(userData)
        .end((err, res) => {
          expect(res.statusCode).toBe(401);
          expect(res.body.error).toBe('Invalid credentials');
          expect(db.User.findOne).toHaveBeenCalledWith({ username: 'nonexistentuser' });
          done();
        });
    });

    it('should return 401 if password is incorrect', (done) => {
      const userData = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      const userInDb = {
        username: 'testuser',
        salt: 'random-salt',
        hash: 'correct-hash',
      };

      const mockUserFindOne = {
        exec: jasmine.createSpy('exec').and.returnValue(Promise.resolve(userInDb)),
      };
      spyOn(db.User, 'findOne').and.returnValue(mockUserFindOne);


      request(app)
        .post('/login')
        .send(userData)
        .end((err, res) => {
          expect(res.statusCode).toBe(401);
          expect(res.body.error).toBe('Invalid credentials');
          expect(db.User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
          done();
        });
    });
  });

  describe('PUT /logout', () => {
    it('should log out an authenticated user', (done) => {

      auth.sessionUser[sessionKey] = { username: 'testuser' };

      request(app)
        .put('/logout')
        .set('Cookie', `sid=${sessionKey}`)
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
          expect(auth.sessionUser[sessionKey]).toBeUndefined();
          expect(res.headers['set-cookie']).toBeDefined();
          done();
        });
    });

    it('should return 401 if user is not authenticated', (done) => {
      request(app)
        .put('/logout')
        .end((err, res) => {
          expect(res.statusCode).toBe(401);
          expect(res.body.error).toBe('Unauthorized');
          done();
        });
    });
  });

  describe('GET /headline', () => {
    it('should return the headline for the authenticated user', (done) => {
      auth.sessionUser[sessionKey] = { username: 'testuser' };

      spyOn(db.Profile, 'findOne').and.returnValue(Promise.resolve({ username: 'testuser', headline: 'Test headline' }));

      request(app)
        .get('/headline')
        .set('Cookie', `sid=${sessionKey}`)
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
          expect(res.body.username).toBe('testuser');
          expect(res.body.headline).toBe('Test headline');
          expect(db.Profile.findOne).toHaveBeenCalledWith({ username: 'testuser' });
          done();
        });
    });

    it('should return the headline for specified user', (done) => {
      auth.sessionUser[sessionKey] = { username: 'testuser' };

      const requestedUser = 'otheruser';

      spyOn(db.Profile, 'findOne').and.returnValue(Promise.resolve({ username: 'otheruser', headline: 'Other user headline' }));

      request(app)
        .get(`/headline/${requestedUser}`)
        .set('Cookie', `sid=${sessionKey}`)
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
          expect(res.body.username).toBe('otheruser');
          expect(res.body.headline).toBe('Other user headline');
          expect(db.Profile.findOne).toHaveBeenCalledWith({ username: 'otheruser' });
          done();
        });
    });

    it('should return 404 if user not found', (done) => {
      auth.sessionUser[sessionKey] = { username: 'testuser' };

      const requestedUser = 'nonexistentuser';

      spyOn(db.Profile, 'findOne').and.returnValue(Promise.resolve(null));

      request(app)
        .get(`/headline/${requestedUser}`)
        .set('Cookie', `sid=${sessionKey}`)
        .end((err, res) => {
          expect(res.statusCode).toBe(404);
          expect(res.body.error).toBe('User not found');
          expect(db.Profile.findOne).toHaveBeenCalledWith({ username: 'nonexistentuser' });
          done();
        });
    });
  });

  describe('PUT /headline', () => {
    it('should update the headline for the authenticated user', (done) => {
      auth.sessionUser[sessionKey] = { username: 'testuser' };

      const newHeadline = 'Updated headline';

      spyOn(db.Profile, 'findOneAndUpdate').and.returnValue(Promise.resolve({ username: 'testuser', headline: newHeadline }));

      request(app)
        .put('/headline')
        .set('Cookie', `sid=${sessionKey}`)
        .send({ headline: newHeadline })
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
          expect(res.body.username).toBe('testuser');
          expect(db.Profile.findOneAndUpdate).toHaveBeenCalledWith(
            { username: 'testuser' },
            { headline: newHeadline },
            { new: true }
          );
          done();
        });
    });

    it('should return 400 if headline is missing', (done) => {
      auth.sessionUser[sessionKey] = { username: 'testuser' };

      request(app)
        .put('/headline')
        .set('Cookie', `sid=${sessionKey}`)
        .send({})
        .end((err, res) => {
          expect(res.statusCode).toBe(400);
          expect(res.body.error).toBe('Headline is required');
          done();
        });
    });
  });
});
