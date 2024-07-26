const express = require('express')
const app = express()

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

let images = [
  {path: 'https://utfs.io/f/99aa4738-04f0-4704-8e65-3200200cfbb3-ka10yz.jpg', info: 'hello'},
  {path: 'https://utfs.io/f/3ecaf671-68b7-46c0-b1e8-7d4f5c11bda5-k9ht8b.jpg'},
  {path: 'https://utfs.io/f/9dcdc1cd-fc8c-488a-a1b3-f2a18f7c50e8-ka10zq.jpg'},
  // {path: 'https://utfs.io/f/4a9df802-2aad-413d-8849-ee276e7ad9cb-ka110i.jpg'},
  {path: 'https://utfs.io/f/9a78725f-b9c4-43dd-bb8d-07030b2d0423-ka10z1.jpg'},
  {path: 'https://utfs.io/f/7ae0da4a-6f9c-48a0-b63e-e9ac3f753182-ka10yv.jpg'},
  {path: 'https://utfs.io/f/685e4aa7-ef27-4a58-9a13-f6a4f476cb29-ka10yy.jpg'},
  {path: 'https://utfs.io/f/16f8b98c-32ea-41b9-86c4-7a8aca322923-ka10zo.jpg'},
  {path: 'https://utfs.io/f/71d10524-cd41-4f92-bf23-967c8b7b4e0f-ka10zr.jpg'},
  {path: 'https://utfs.io/f/9e83cb42-6d7a-4675-ab0b-a67bc7ab9bf9-ka10z0.jpg'}
]

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

const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => n.id))
    : 0
  return maxId + 1
}

app.post('/api/notes', (request, response) => {
  const body = request.body

  if (!body.content) {
    return response.status(400).json({ 
      error: 'content missing' 
    })
  }

  const note = {
    content: body.content,
    important: body.important || false,
    id: generateId(),
  }

  notes = notes.concat(note)

  response.json(note)
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