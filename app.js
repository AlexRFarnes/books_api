const express = require('express');
const { ObjectId } = require('mongodb');
const { connectToDb, getDb } = require('./db');

// init app & middleware
const app = express();
app.use(express.json());

// db connection
let db;

connectToDb(err => {
  if (!err) {
    // listen on Port 3000
    app.listen(3000, () => {
      console.log('App listening on port 3000');
    });
    db = getDb();
  }
});

// routes
app.get('/books', (req, resp) => {
  // current page
  const page = req.query.p || 0;
  const booksPerPage = 2;

  let books = [];

  db.collection('books')
    .find()
    .sort({ author: 1 })
    .skip(page * booksPerPage)
    .limit(booksPerPage)
    .forEach(book => books.push(book))
    .then(() => {
      resp.status(200).json(books);
    })
    .catch(err => {
      resp.status(500).json({ error: 'Could not fetch the documents' });
    }); // cursor toArray forEach
});

app.get('/books/:id', (req, resp) => {
  if (ObjectId.isValid(req.params.id)) {
    db.collection('books')
      .findOne({ _id: ObjectId(req.params.id) })
      .then(book => {
        resp.status(200).json(book);
      })
      .catch(err => {
        resp.status(500).json({ error: 'Could not fetch the document' });
      });
  } else {
    resp.status(500).json({ error: 'Not a valid document id' });
  }
});

app.post('/books', (req, resp) => {
  const book = req.body;

  db.collection('books')
    .insertOne(book)
    .then(result => {
      resp.status(201).json(result);
    })
    .catch(err => {
      resp.status(500).json({ error: 'Could not create a new document' });
    });
});

app.delete('/books/:id', (req, resp) => {
  if (ObjectId.isValid(req.params.id)) {
    db.collection('books')
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then(result => {
        resp.status(200).json(result);
      })
      .catch(err => {
        resp.status(500).json({ error: 'Could not delete the document' });
      });
  } else {
    resp.status(500).json({ error: 'Not a valid document id' });
  }
});

app.patch('/books/:id', (req, resp) => {
  const updates = req.body;

  if (ObjectId.isValid(req.params.id)) {
    db.collection('books')
      .updateOne({ _id: ObjectId(req.params.id) }, { $set: updates })
      .then(result => {
        resp.status(200).json(result);
      })
      .catch(err => {
        resp.status(500).json({ error: 'Could not update the document' });
      });
  } else {
    resp.status(500).json({ error: 'Not a valid document id' });
  }
});
