const express = require('express');
const request = require('supertest');
const articlesRouter = require('../controllers/articles'); 
const db = require('../models/db'); 
const auth = require('../controllers/auth'); 
const cookieParser = require('cookie-parser');

describe('Articles API', () => {
  let app;
  const sessionKey = 'test-session-key';

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());

    auth.sessionUser[sessionKey] = { username: 'testuser' };

    app.use('/articles', articlesRouter);
  });

  afterEach(() => {
    jasmine.getEnv().allowRespy(true);
    delete auth.sessionUser[sessionKey];
  });

  describe('GET /articles', () => {
    it('should fetch articles in the user\'s feed', (done) => {
      const mockProfile = {
        exec: jasmine.createSpy('exec').and.returnValue(Promise.resolve({
          username: 'testuser',
          following: ['user1', 'user2'],
        })),
      };
      spyOn(db.Profile, 'findOne').and.returnValue(mockProfile);

      const mockArticles = {
        exec: jasmine.createSpy('exec').and.returnValue(Promise.resolve([
          { author: 'testuser', text: 'Article 1' },
          { author: 'user1', text: 'Article 2' },
        ])),
      };
      spyOn(db.Article, 'find').and.returnValue(mockArticles);

      request(app)
        .get('/articles')
        .set('Cookie', `sid=${sessionKey}`)
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
          expect(res.body.articles.length).toBe(2);
          expect(db.Article.find).toHaveBeenCalledWith({ author: { $in: ['user1', 'user2', 'testuser'] } });
          done();
        });
    });
  });

  describe('GET /articles/:id', () => {
    it('should fetch an article by id', (done) => {
      const articleId = '123';

      const mockArticleFindOne = {
        exec: jasmine.createSpy('exec').and.returnValue(Promise.resolve({
          _id: articleId,
          author: 'testuser',
          text: 'Article 1',
        })),
      };
      spyOn(db.Article, 'findOne').and.returnValue(mockArticleFindOne);

      request(app)
        .get(`/articles/${articleId}`)
        .set('Cookie', `sid=${sessionKey}`)
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
          expect(res.body.articles.length).toBe(1);
          expect(res.body.articles[0]._id).toBe(articleId);
          expect(db.Article.findOne).toHaveBeenCalledWith({ _id: articleId });
          done();
        });
    });

    it('should fetch articles by username when id is not an article id', (done) => {
      const username = 'user1';
      const mockFindOne = {
        exec: jasmine.createSpy('exec').and.returnValue(Promise.resolve(null)),
      };
      spyOn(db.Article, 'findOne').and.returnValue(mockFindOne);

      const mockFind = {
        exec: jasmine.createSpy('exec').and.returnValue(Promise.resolve([
          { author: username, text: 'Article 1' },
          { author: username, text: 'Article 2' },
        ])),
      };
      spyOn(db.Article, 'find').and.returnValue(mockFind);

      request(app)
        .get(`/articles/${username}`)
        .set('Cookie', `sid=${sessionKey}`)
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
          expect(res.body.articles.length).toBe(2);
          expect(db.Article.findOne).toHaveBeenCalledWith({ _id: username });
          expect(db.Article.find).toHaveBeenCalledWith({ author: username });
          done();
        });
    });
  });


  describe('POST /articles', () => {
    it('should add a new article', (done) => {
      const newArticleData = {
        // _id: '456',
        author: 'testuser',
        text: 'New article text',
        date: new Date(),
        comments: [],
      };

      const mockSave = jasmine.createSpy('save').and.returnValue(Promise.resolve(newArticleData));
      spyOn(db, 'Article').and.callFake((data) => {
        return {
          ...data,
          save: mockSave,
        };
      });

      request(app)
        .post('/articles')
        .set('Cookie', `sid=${sessionKey}`)
        .send({ text: 'New article text' })
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
          expect(res.body.articles.length).toBe(1);
          expect(res.body.articles[0].text).toBe('New article text');
          done();
        });
    });

    it('should return 400 if text is missing', (done) => {
      request(app)
        .post('/articles')
        .set('Cookie', `sid=${sessionKey}`)
        .send({})
        .end((err, res) => {
          expect(res.statusCode).toBe(400);
          expect(res.body.error).toBe('Text is required');
          done();
        });
    });
  });
});
