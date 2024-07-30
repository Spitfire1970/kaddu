const express = require('express')
const app = express()
const data = require('./all_data')
const puppeteer = require('puppeteer');

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
let name_favourites = data.favourites

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

app.get('/api/favourites', (request, response) => {

  async function getMovieInfo(movieName, id) {
    console.log('id', id)
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log('Browser console:', msg.text()));

    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(movieName)}`);
  
    const movieInfo = await page.evaluate((id) => {
      let element = document.querySelector('.PZPZlf.ssJ7i.B5dxMb');
      const title = element ? element.textContent.trim() : 'N/A';

      element = document.querySelectorAll('.gsrt.KMdzJ');

      const imdb = element[0] ? element[0].textContent.trim() : 'N/A';
      const rotten = element[1] ? element[1].textContent.trim() : 'N/A';

      element = document.querySelectorAll('.iAIpCb.PZPZlf span');

      const deets = element ? element[element.length-1].textContent.trim() : null;
      let year = 'N/A'
      let genre = 'N/A'
      let runtime = 'N/A'

      if (deets) {
        const all_deets = deets.split(' ‧ ')
        year = all_deets[0]
        genre = all_deets[1]
        runtime = all_deets[2]
      }

      imdb_url = document.querySelector('.TZahnb.vIUFYd').getAttribute("href");
  
      return {
        id: id,
        title: title,
        year: year,
        genre: genre,
        runtime: runtime,
        imdb: imdb,
        rotten: rotten,
        imdb_url: imdb_url
      };
    }, id);

    const browser2 = await puppeteer.launch({
    });
    const page2 = await browser.newPage();

    await page2.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    page2.on('console', msg => console.log('Browser console:', msg.text()));

    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(movieName + ' movie poster')}&tbm=isch`;
    
    await page2.goto(searchUrl);

    const imageSrc = await page2.evaluate((movieName) => {
      const temp = document.querySelector('.rg_i.Q4LuWd');
      if (temp) {
      return temp.src}
      const images = Array.from(document.querySelectorAll('img'));
      for (let img of images) {
        if (img.width < 100 || img.height < 100) continue;
        const altText = img.alt.toLowerCase();
        const parentText = img.parentElement.textContent.toLowerCase();
        if (altText.includes(movieName.toLowerCase()) || parentText.includes(movieName.toLowerCase())) {
          return img.src || img.getAttribute('data-src') || img.getAttribute('data-iurl');
        }
      }
      return null;
    }, movieName);

    // console.log('image src,', imageSrc)

    await browser.close();
    return {...movieInfo, image_src:imageSrc};
  }

  async function processMovieList(movieList) {
    const movieObjects = [];
  
    for (let i = 0; i < movieList.length; i++) {
      const movie = movieList[i]
      const movieInfo = await getMovieInfo(movie.name, i);
      if (movieInfo) {
        movieObjects.push(movieInfo);
      } else {
        console.log(`Could not find information for: ${movie}`);
      }
    }
  
    return movieObjects;
  }

  processMovieList(name_favourites)
  .then(results => {response.json(results);
    // console.log(JSON.stringify(results));
  })
})

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
  response.json(todo)
})

app.put('/api/todos/:id', (request, response) => {
  const body = request.body

  if (!body.task) {
    return response.status(400).json({ 
      error: 'task content missing' 
    })
  }

  const new_status = body.status === 'i' ? 'c' : 'i'

  const todo = {
    id: body.id,
    task: body.task,
    status: new_status,
    created: body.created
  }

  todos = todos.filter((todo) => todo.id !== body.id)
  todos = todos.concat(todo)
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