const { Router } = require('express');
const { MongoClient } = require('mongodb');

const getNextSequence = require('./getNextSequence');
const newMessageText = 'Our thought-reading AutoCompose® framework encountered an error. Please edit this message to enter your text manually.';

const router = Router();
const dbClient = MongoClient('mongodb://localhost:27017');

const getDatabase = async () => {
  await dbClient.connect();
  return await dbClient.db('stortala');
};

router.get('/authors', async (_, res) => {
  const db = await getDatabase();
  const collection = db.collection('authors');
  const cursor = await collection.find({}, { projection: { _id: 0 } });
  const authors = await cursor.toArray();

  res.send({ authors });
});

router.post('/authors', async (req, res) => {
  const db = await getDatabase();
  const collection = db.collection('authors');
  const id = await getNextSequence(db, 'authors');

  const result = await collection.insertOne({
    ...req.body,
    id,
  });

  res.send({
    author: result.ops[0]
  });
});

router.get('/messages', async (_, res) => {
  const db = await getDatabase();
  const collection = db.collection('messages');
  const cursor = await collection.find({}, { projection: { _id: 0 } });
  const messages = await cursor.toArray();

  res.send({ messages });
});

router.post('/messages', async (req, res) => {
  const db = await getDatabase();
  const collection = db.collection('messages');
  const id = await getNextSequence(db, 'messages');

  const result = await collection.insertOne({
    parentId: null,
    ...req.body,
    text: req.body.text || newMessageText,
    id,
    created: (new Date()).getTime(),
  });

  res.send({
    message: result.ops[0],
  });
});

router.put('/messages/:id', async (req, res) => {
  const db = await getDatabase();
  const collection = db.collection('messages');
  const message = req.body;
  const id = parseInt(req.params.id, 10);

  const result = await collection.findOneAndUpdate(
    { id },
    { $set: { text: message.text } },
    { returnOriginal: false },
  );

  res.send(result.value);
});

router.delete('/messages/:id', async (req, res) => {
  const db = await getDatabase();
  const collection = db.collection('messages');
  const id = parseInt(req.params.id, 10);

  await collection.deleteOne({ id });

  res.sendStatus(204);
});


module.exports = router;
