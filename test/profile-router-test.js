'use strict';

require('dotenv').config({path: `${__dirname}/../.test.env`});

const superagent = require('superagent');
const expect = require('expect');

const clearDB = require('./lib/clear-db.js');
const User = require('../model/user.js');
const mockProfile = require('./lib/mock-profile.js');
const server = require('../lib/server.js');

const APP_URL = process.env.APP_URL;

describe('Testing Profile /api/profiles routes', () => {
  before(server.start);
  after(server.stop);
  afterEach(clearDB);

  describe('Testing GET /api/profiles route', () => {
    describe('If the get multiple is successful', () => {
      it('It should return all profiles', () => {
        return mockProfile.mockMultiple(10)
          .then(() =>
            superagent.get(`${APP_URL}/api/profiles`)
          )
          .then(res => {
            console.log('res.body:', res.body);
            expect(res.status).toEqual(200);
            res.body.forEach(profile => {
              expect(profile).toIncludeKeys([`__v`, `_id`, `userID`, `userName`]);
              expect(profile.userID).toExist();
              expect(profile.userName).toExist();
            });
          });
      });
    });
    describe('If the get is successful', () => {
      it('It should return a specific user profile by username', () => {
        let userData = {
          userName: `dingo`,
          password: `user password`,
          email: `user@example.com`,
        };
        return User.create(userData)
          .then(() => {
            return superagent.get(`${APP_URL}/api/profiles`)
              .send({userName: `dingo`})
              .then(res => {
                expect(res.body[0].userName).toEqual(userData['userName']);
                expect(res.body[0]._id).toExist();
                expect(res.body[0].userID).toExist();
              });
          });
      });
    });
    describe('If passing in a bad username', () => {
      it('It should return a 404', () => {
        let userData = {
          userName: `dingo`,
          password: `user password`,
          email: `user@example.com`,
        };
        return User.create(userData)
          .then(() => {
            return superagent.get(`${APP_URL}/api/profiles`)
              .send({userName: `badusername`})
              .catch(err => {
                expect(err.status).toEqual(404);
              });
          });
      });
    });
    describe('If passing in bad pathname', () => {
      it('It should return a 404', () => {
        return mockProfile.mockOne()
          .then(() => {
            return superagent.get(`${APP_URL}/api/badpathname`)
              .catch(err => {
                expect(err.status).toEqual(404);
              });
          });
      });
    });
  });

  describe('Testing PUT /api/profiles route', () => {
    describe('If successful', () => {
      it('It should return an updated profile and 200', () => {
        let tempUser;
        return mockProfile.mockOne()
          .then(user => {
            tempUser = user;
            console.log('tempUser: ', tempUser);
            let updatedProfile = {
              skillLevel: 'beginner',
              ridingStyle: 'flow',
              photoURI: 'http://p.vitalmtb.com/photos/users/2/photos/59694/s1200_minnaar_5846.jpg?1374617933',
            };
            return superagent.put(`${APP_URL}/api/profiles/${tempUser._id}`)
              .set('Authorization', `Bearer ${tempUser.token}`)
              .send(updatedProfile)
              .then(res => {
                console.log('res.body:', res.body);
                expect(res.status).toEqual(200);
                expect(res.body.userName).toEqual(tempUser.userName);
                expect(res.body.skillLevel).toEqual(updatedProfile.skillLevel);
                expect(res.body.userName).toEqual(updatedProfile.ridingStyle);
              });
          });
      });
    });
  });
});
