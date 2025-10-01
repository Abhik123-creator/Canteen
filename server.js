const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
app.use(cors())
app.use(express.json())

const DATA_FILE = path.join(__dirname, 'data.json')

app.get('/api/data', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if(err) return res.status(500).json({ error: 'Failed to read data file' })
    try{
      const json = JSON.parse(data)
      res.json(json)
    }catch(e){
      res.status(500).json({ error: 'Invalid JSON in data file' })
    }
  })
})

app.post('/api/data', (req, res) => {
  const body = req.body
  if(!body || typeof body !== 'object') return res.status(400).json({ error: 'Invalid payload' })
  // simple validation
  if(typeof body.fund !== 'number' || !Array.isArray(body.friends)){
    return res.status(400).json({ error: 'Invalid data format' })
  }
  fs.writeFile(DATA_FILE, JSON.stringify(body, null, 2), 'utf8', (err) => {
    if(err) return res.status(500).json({ error: 'Failed to write data file' })
    res.json({ ok: true })
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, ()=>{
  console.log('Server listening on http://localhost:' + PORT)
})
