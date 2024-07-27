const express = require('express')
const app = express()
const data = require('./all_data')

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    important: true
  },
  {
    id: 2,
    content: "Browser can execute only JavaScript",
    important: false
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true
  }
]

let images = data.images
let todos = data.todos

app.use(express.static('dist'))

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const cors = require('cors')

app.use(cors())

app.use(express.json())
app.use(requestLogger)

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// app.get('/', (request, response) => {
//   response.send('<h1>Hello World!</h1>')
// })

app.get('/api/gallery', (request, response) => {
  response.json(images)
})

app.get('/api/todos', (request, response) => {
  response.json(todos)
})

const generateId = () => {
  const maxId = todos.length > 0
    ? Math.max(...todos.map(n => n.id))
    : 0
  return maxId + 1
}

app.post('/api/todos', (request, response) => {
  const body = request.body

  if (!body.task) {
    return response.status(400).json({ 
      error: 'task content missing' 
    })
  }

  const todo = {
    id: generateId(),
    task: body.task,
    status: body.status || 'i',
    created: body.created
  }

  todos = todos.concat(todo)
  console.log(todos)
  response.json(todo)
})

app.get('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  const note = notes.find(note => note.id === id)
  if (note) {
    response.json(note)
  } else {
    console.log('x')
    response.status(404).end()
  }
})

app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  notes = notes.filter(note => note.id !== id)

  response.status(204).end()
})

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})