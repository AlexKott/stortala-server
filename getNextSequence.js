module.exports = async (db, name) => {
  const result = await db.collection('counters').findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { upsert: true, returnOriginal: false },
  );
  return result.value.seq;
};
