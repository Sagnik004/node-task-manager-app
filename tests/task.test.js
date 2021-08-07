const request = require('supertest');

const app = require('../src/app');
const Task = require('../src/models/task');
const { userOne, userTwo, taskOne, setupData } = require('./fixtures/db');

beforeEach(setupData);

test('Should create task for user', async () => {
  const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ description: 'From my test' })
    .expect(201);

  // Assert that the task is inserted successfully in db
  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();

  // Assert that completed field is false
  expect(task.completed).toEqual(false);
});

test('Should get all tasks for user', async () => {
  const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  // Assert that user have 2 tasks
  expect(response.body.length).toEqual(2);
});

test('Should get only one completed task for user', async () => {
  const response = await request(app)
    .get('/tasks?completed=true')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  // Assert that user have 1 completed tasks
  expect(response.body.length).toEqual(1);
});

test("One user shouldn't be able to delete tasks of other users", async () => {
  await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);

  // Assert that the task is not deleted from db
  const task = await Task.findById(taskOne._id);
  expect(task).not.toBeNull();
});
