require('dotenv').config();
const express = require("express");
const app = express();

// Socket.io imports
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");


const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const fs = require('fs')

const path = require('path');

const helmet = require('helmet');

const config = require('./config');

const { appConfig } = config;

const PORT = process.env.PORT || 8000


const io = new Server(server);

const Web3 = require('web3');
const web3 = new Web3(
  new Web3.providers.WebsocketProvider(`wss://mainnet.infura.io/ws/v3/${process.env.INFURA_KEY}`)
);


app.use(helmet());
app.use(bodyParser.json());
// APP USE - Cookie Parser - create read write cookies
app.use(cookieParser(process.env.COOKIES_SECRET_KEY))


// Initialise
const init = async (socket) => {

  // Set up subscriber
  await web3.eth.subscribe('newBlockHeaders')
  .on('data', async block => {

    // console.log(`New block received. Block # ${block.number}`);
    // Emit in name group new_block the new block number
    socket.emit("new_block", {blockNumber: block.number}, msg => {
      console.log('issued msg', msg)
    });

    // Log success and block_number to DB
    // log.info(`Successfully submitted block_number`);

  })
  .on('error', error => {
    // if there is an error - olg error for now
    console.log(error);

    // error will be sent to DB log in future
    // log.error(err);
  });
}


// Set up Socket.io connection
io.on('connection', async (socket) => {

  // Emit status of the app application
  socket.emit("status", "running");

  // Initialise block number issuance
  init(socket);
});


app.listen(PORT, function(){
  console.log(`${app.get('env')} - ${appConfig.infrastructure} ${appConfig.type} servicing ${appConfig.name} ${appConfig.department} is starting on port ${PORT}`);
})
