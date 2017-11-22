const knex = require('../lib/knex')
const express = require('express')
const router = express.Router()

function checkInput({id}) {
  if (!id || Number.isNaN(id)) {
    throw new Error('Invalid ID')
  }
  return id
}

function getOne(id) {
  return knex('books')
    .where('id', id)
    .first()
}

function update(book) {
  return knex('books')
    .update({
      title: book.title,
      author: book.author,
      genre: book.genre,
      description: book.description,
      cover_url: book.coverUrl,
    }, '*')
    .where('id', book.id)
}

function getAll(){
  return knex ('books')
  .orderBy('title', 'ASC')
}

router.get('/:id', (req, res, next) => {
  let id = checkInput(req.params)
  getOne(id)
  .then((data) => {
    res.send(data)
  })
  .catch(err => {
    res.status(500).send(err)
  })
})

router.get('/', (req, res, next) => {
  getAll()
  .then(data => res.send(data))
  .catch(err => res.status(500).send(err))
})

router.post('/', (req, res, next) => {
  // Make sure that the information that you want is in the request body.
  knex('books')
    .insert({
      title: req.body.title,
      author: req.body.author,
      genre: req.body.genre,
      description: req.body.description,
      cover_url: req.body.coverUrl,
    }, '*')
    .then(([bookId]) => {
      res.send({bookId})
    })
    .catch(err => {
      next(err)
    })
})

router.put('/:id', (req, res, next) => {
  return Promise
  .resolve(checkInput(req.params))
  .then(getOne)
  .then(book => {
    if (!book || book.length === 0) {
      return res.status(404).send({message: 'Not found'})
    }
    return req.body
  })
  .then(update)
  .then(books => {
    if (!books) { return {message: 'nothing found for given id'} }
    const newObj = {
      id: books[0].id,
      title: books[0].title,
      author: books[0].author,
      genre: books[0].genre,
      description: books[0].description,
      coverUrl: books[0].cover_url,
    }
    res.send(newObj)
  })
  .catch(err => {
    next(err)
  })
})

router.delete('/:id', (req, res, next) => {
  let book = null
  let id = checkInput(req.params)
  knex('books')
    .del()
    .where('id', id)
    .catch(err => res.status(500).send(err))
    .then(data => {
      res.status(200).send({deleted: data})
    })
})

module.exports = router
