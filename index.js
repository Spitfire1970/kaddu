const express = require('express');
const mongoose = require('mongoose');
const app = express();

const puppeteer = require('puppeteer');

const multer = require('multer');
const path = require('path');

const Image = require('./models/image');
const Todo = require('./models/todo');
const Favourite = require('./models/favourite');
const Quote = require('./models/quote');
const Blog = require('./models/blog')
const Log = require('./models/log')

require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI, {
  retryWrites: true,
  w: 'majority'
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Error connecting to MongoDB Atlas:', err));

app.use(express.static('dist'));

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:  ', request.path);
  console.log('Body:  ', request.body);
  console.log('---');
  next();
};

const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(requestLogger);

// ALL CLIENT SIDE ROUTING IS BEING HANDLED BY THIS UNKNOWN ENDPOINT MIDDLEWARE LOL
const unknownEndpoint = (request, response) => {
  // response.status(404).send({ error: 'unknown endpoint' });
  response.sendFile(path.join(__dirname, 'dist', 'index.html'));
};

app.get('/api/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/favourites', async (request, response) => {
  try {
    const favourites = await Favourite.find({});
    response.json(favourites);
  } catch (error) {
    console.error('Error fetching favourites:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/logs', async (request, response) => {
  try {
    const logs = await Log.find({});
    response.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/gallery', async (request, response) => {
  try {
    const images = await Image.find({});
    response.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/goodstuff', async (request, response) => {
  try {
    const quotes = await Quote.find({});
    response.json(quotes);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/todos', async (request, response) => {
  try {
    const todos = await Todo.find({});
    response.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/blogs', async (request, response) => {
  try {
    const blogs = await Blog.find({});
    response.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/logs', async (request, response) => {
  try {
    const images = await Image.find({});
    response.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/todos', async (request, response) => {
  const body = request.body;

  if (!body.task) {
    return response.status(400).json({ 
      error: 'task content missing' 
    });
  }

  const todo = new Todo({
    task: body.task,
    status: body.status || 'i',
    created: body.created
  });

  try {
    const savedTodo = await todo.save();
    response.json(savedTodo);
  } catch (error) {
    console.error('Error saving todo:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/blogs', async (request, response) => {
  const body = request.body;

  if (!body.content) {
    return response.status(400).json({ 
      error: 'content missing' 
    });
  }

  const blog = new Blog({
    datetime: body.datetime,
    tags: body.tags,
    rating: body.rating,
    content: body.content
  });

  try {
    const savedBlog = await blog.save();
    response.json(savedBlog);
  } catch (error) {
    console.error('Error saving blog:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/goodstuff', async (request, response) => {
  const body = request.body;

  if (!body.text) {
    return response.status(400).json({ 
      error: 'quote missing' 
    });
  }

  const quote = new Quote({
    text: body.text,
    vid: body.vid
  });

  try {
    const savedQuote = await quote.save();
    response.json(savedQuote);
  } catch (error) {
    console.error('Error saving quote:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/favourites', async (request, response) => {
    const body = request.body;
  
    if (!body.title) {
      return response.status(400).json({ 
        error: 'movie name missing' 
      });
    }

    const favouriteObject = await getMovieInfo(body.title);
    if (Object.keys(favouriteObject).length !== 0) {
      const favourite = new Favourite(favouriteObject);
      try {
        const savedFavourite = await favourite.save();
        console.log(savedFavourite)
        response.json(savedFavourite);
      } catch (error) {
        console.error('Error saving favourite:', error);
        response.status(500).json({ error: 'Internal server error' });
      }
    }

    else {
      response.json(null);
    }
  });

app.put('/api/todos/:id', async (request, response) => {
  const body = request.body;

  if (!body.task) {
    return response.status(400).json({ 
      error: 'task content missing' 
    });
  }

  const new_status = body.status === 'i' ? 'c' : 'i';

  try {
    const updatedTodo = await Todo.findOneAndUpdate(
      { id: parseInt(request.params.id) },
      { task: body.task, status: new_status, created: body.created },
      { new: true }
    );

    if (updatedTodo) {
      response.json(updatedTodo);
    } else {
      response.status(404).json({ error: 'Todo not found' });
    }
  } catch (error) {
    console.error('Error updating todo:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images/');
  },
  filename: (req, file, cb) => {
    console.log('file received', file)
    const new_name = Date.now() + file.originalname
    cb(null, new_name);
  }
});

const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('image'), async (req, res) => {
  console.log('stringify', JSON.parse(req.body.info))
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  console.log('name given', req.file.filename)
  const imageObject = {
    path: `/api/images/${req.file.filename}`,
    info: req.body.info
  }
  const image = new Image(imageObject)
  try {
    const savedImage = await image.save()
    console.log(savedImage)
    res.json(savedImage);
    console.log('File uploaded successfully');
  } catch (error) {
    console.error('Error saving image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.use('/api/images', express.static(path.join(__dirname, 'images')));

app.get('/api/imagelist', async (req, res) => {
  // const imageFolder = path.join(__dirname, 'images');
  
  // fs.readdir(imageFolder, (err, files) => {
  //   if (err) {
  //     return res.status(500).json({ error: 'Unable to scan directory' });
  //   }
    
  //   const imageFiles = files.filter(file => {
  //     const ext = path.extname(file).toLowerCase();
  //     return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
  //   });
  try {
    const images = await Image.find({});
    res.json(images);
  } catch (error) {
    console.error('Error fetching todos:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
    
    // const imageUrls = imageFiles.map((file, index) => {return {id:index, path: `/api/images/${file}`}});
    // res.json(imageUrls);
  // })
})

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

async function getMovieInfo(movieName) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // uncomment below line to do debugging
    // page.on('console', msg => console.log('Browser console:', msg.text())); 

    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(movieName)}`);
    const movieInfo = await page.evaluate(() => {
      let element = document.querySelector('.PZPZlf.ssJ7i');
      const title = element ? element.textContent.trim() : 'N/A';

      element = document.querySelectorAll('.gsrt.KMdzJ');
      let imdb =  'N/A'
      let rotten = 'N/A'
      for (let i = 0; i < element.length; i++) {
        const ele = element[i].textContent.trim()
        if (ele.includes("%")) {
          rotten = ele
        }
        else if (ele.includes("/10")) {
          imdb = ele
        }
        if (imdb !== "N/A" && rotten !== "N/A") {break;}
      }

      element = document.querySelectorAll('.iAIpCb.PZPZlf span');

      const deets = element.length > 0 ? element[element.length-1].textContent.trim() : null;
      let year = 'N/A'
      let genre = 'N/A'
      let runtime = 'N/A'

      if (deets) {
        const all_deets = deets.split(' ‧ ')
        year = all_deets[0]
        genre = all_deets[1]
        runtime = all_deets[2]
      }

      imdb_url = document.querySelector('.TZahnb.vIUFYd')?.getAttribute("href");
      return {
        title: title,
        year: year,
        genre: genre,
        runtime: runtime,
        imdb: imdb,
        rotten: rotten,
        imdb_url: imdb_url
      };
    });

    const page2 = await browser.newPage();

    // await page2.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    page2.on('console', msg => console.log('Browser console:', msg.text()));

    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(movieName + ' movie/tv show vertical poster')}&tbm=isch`;
    
    await page2.goto(searchUrl);

    const imageSrc = await page2.evaluate((movieName) => {
      const temp = document.querySelector('.rg_i.Q4LuWd');
      if (temp && (temp.width > 100 || temp.height > 100)) {
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

    if (!movieInfo.genre || movieInfo.genre == 'N/A' || !movieInfo.year || movieInfo.year == 'N/A') {
      return ({})
    }

    await browser.close();
    return {...movieInfo, image_src:imageSrc};
}