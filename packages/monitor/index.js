require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { readFile } = require('./utils/file')
const cron = require('node-cron');
const {checkWorker} = require("./checkWorker");
const {checkWorker2} = require("./checkWorker2");
const {checkWorker3} = require("./checkWorker3");

const app = express()
const bridgeRouter = express.Router({ mergeParams: true })

app.use(cors())

app.get('/favicon.ico', (req, res) => res.sendStatus(204))
app.use('/:bridgeName', bridgeRouter)

cron.schedule('* * * * *', async () => {
  console.log("==> Internal cron scheduler")
  console.log("==> Running worker 1")
  await checkWorker()
  console.log("==> Running worker 2")
  await checkWorker2()
  console.log("==> Running worker 3")
  await checkWorker3()
  console.log("==> Worker execution finished")
});

bridgeRouter.get('/:file(validators|eventsStats|alerts|mediators|stuckTransfers|failures)?', (req, res, next) => {
  try {
    const { bridgeName, file } = req.params
    const results = readFile(`./responses/${bridgeName}/${file || 'getBalances'}.json`)
    res.json(results)
  } catch (e) {
    // this will eventually be handled by your error handling middleware
    next(e)
  }
})

bridgeRouter.get('/metrics', (req, res, next) => {
  try {
    const { bridgeName } = req.params
    const metrics = readFile(`./responses/${bridgeName}/metrics.txt`, false)
    res.type('text').send(metrics)
  } catch (e) {
    next(e)
  }
})

const port = process.env.PORT
app.set('port', port)
app.listen(port, () => console.log(`Monitoring app listening on port ${port}!`))
