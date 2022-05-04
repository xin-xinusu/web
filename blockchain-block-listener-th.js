require("dotenv").config()
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

const Web3 = require('web3');
const web3 = new Web3(
  new Web3.providers.WebsocketProvider(`wss://mainnet.infura.io/ws/v3/${process.env.INFURA_KEY}`)
);


const init = async (socket) => {
  await web3.eth.subscribe('newBlockHeaders')
  .on('data', async block => {
    console.log(`New block received. Block # ${block.number}`);
    socket.emit("new_block", {blockNumber: block.number});
  })
  .on('error', error => {
    console.log(error);
  });
}
//


io.on('connection', async (socket) => {
  console.log('a user connected');
  socket.emit("status", "running");
  init(socket);
});

server.listen(7700, () => {
  console.log('listening on *:7700');
});
