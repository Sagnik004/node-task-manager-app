const request = require('supertest');

const app = require('../src/app');
const User = require('../src/models/user');
const { userOneId, userOne, setupData } = require('./fixtures/db');

beforeEach(setupData);

test('Should signup a new user', async () => {
  const response = await request(app)
    .post('/users')
    .send({
      name: 'Sagnik Chakraborty',
      email: 'sagnikchakraborty910@yahoo.com',
      password: 'SagnikJeez21',
    })
    .expect(201);

  // Assert that the db was changed correctly
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  // Assertions about the response
  expect(response.body).toMatchObject({
    user: {
      name: 'Sagnik Chakraborty',
      email: 'sagnikchakraborty910@yahoo.com',
    },
    token: user.tokens[0].token,
  });

  // Assert that plain text password is not saved in db
  expect(user.password).not.toBe('SagnikJeez21');
});

test('Should login existing user', async () => {
  const response = await request(app)
    .post('/users/login')
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  // Assert token from response matches with users second token
  const user = await User.findById(response.body.user._id);
  expect(response.body.token).toBe(user.tokens[1].token);
});

test('Should not login non-existent user', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: 'abc@test.com',
      password: 'idontexist<3',
    })
    .expect(400);
});

test('Should get profile for user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should not get profile for unauthenticated user', async () => {
  await request(app).get('/users/me').send().expect(401);
});

test('Should delete account for user', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  // Assert user is not found
  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});

test("Shouldn't delete account for unauthenticated user", async () => {
  await request(app).delete('/users/me').send().expect(401);
});

test('Should upload avatar image', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200);

  // Assert that binary data was saved
  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ name: 'Andrew_Mead' })
    .expect(200);

  // Assert that name updated successfully in db
  const user = await User.findById(userOneId);
  expect(user.name).toBe('Andrew_Mead');
});

test('Should not update invalid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ location: 'Chennai' })
    .expect(400);
});
