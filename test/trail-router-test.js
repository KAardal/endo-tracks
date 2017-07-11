'use strict';

require('dotenv').config({path: `${__dirname}/../.test.env`});

const expect = require('expect');
const superagent = require ('superagent');
const server = require('../lib/server.js');
const clearDB = require('./lib/clear-db.js');
const mockUser = require('./lib/mock-user.js');
// const mockTrail = require('./lib/mock-.js');
// const mockAWS = require('./lib/mock-aws.js');
// const mockComment = require('./lb/mock-comment.js');
const APP_URL = process.env.APP_URL;

let tempUserData;

describe('testing trail router', () => {
  before(server.start);
  after(server.stop);
  afterEach(clearDB);

  describe('testing POST /api/trails', () => {
    it('should respond with a trail', () => {
      return mockUser.mockOne()
        .then(userData => {
          console.log('userData XXXXXXXXXX', userData);
          tempUserData = userData;
          return superagent.post(`${APP_URL}/api/trails`)
            .set('Authorization', `Bearer ${tempUserData.user.token}`)
            .send({
              trailName: 'example trail name',
              difficulty:  'example difficulty',
              type: 'example type',
              distance: 'example distance',
              elevation: 'example elevation',
              lat: 'number between -90 and 90',
              long: 'number between -180 and 180',
              zoom: 'number between 0 - 21',
              comment: 'example comments',
              mapURI: `${__dirname}/assets/map.png`,
            });
        })
        .then(res => {
          console.log('POST YYYYYYYYYY res.body', res.body);
          expect(res.status).toEqual(200);
          expect(res.body.trailName).toEqual('new trail name');
          expect(res.body.difficulty).toEqual('trail difficulty');
          expect(res.body.type).toEqual('trail type');
          expect(res.body.distance).toEqual('trail distance');
          expect(res.body.elevation).toEqual('trail elevation');
          expect(res.body.lat).toEqual('trail lat');
          expect(res.body.long).toEqual('trail long');
          expect(res.body.zoom).toEqual('trail zoom');
          expect(res.body.mapURI).toExist();
          expect(res.body.userID).toEqual(tempUserData.user._id.toString());
        });
    });

    it('should respond with a 404', () => {
      return superagent.post(`${APP_URL}/api/trails`)
        .set('Authorization', `Bearer ${tempUserData.user.token}`)
        .send()
        .catch(err => {
          expect(err.status).toEqual(404);
        });
    });

    it('should respond with a 401', () => {
      return superagent.post(`${APP_URL}/api/trails`)
        .set({Authorization: 'Bad Token'})
        .send({
          trailName: 'example trail name',
          difficulty:  'example difficulty',
          type: 'example type',
          distance: 'example distance',
          elevation: 'example elevation',
          lat: 'number between -90 and 90',
          long: 'number between -180 and 180',
          zoom: 'number between 0 - 21',
          comment: 'example comments',
          mapURI: `${__dirname}/assets/map.png`,
        })
        .catch(err => {
          expect(err.status).toEqual(401);
        });
    });

    it('should respond with a 400', () => {
      return mockUser.mockOne()
        .then(userData => {
          tempUserData = userData;
          return superagent.post(`${APP_URL}/api/trails`)
            .set('Authorization', `Bearer ${tempUserData.user.token}`)
            .send({})
            .catch(err => {
              expect(err.status).toEqual(400);
            });
        });
    });

  });
});
