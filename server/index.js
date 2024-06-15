const express = require('express')
const app = express()
const cors = require('cors')
const {Server} = require('socket.io')

app.use(cors())

const server = app.listen(5000, () => console.log("Your server is runnging on http://localhost:5000"))

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
})

io.on('connection', (socket) => {
    console.log(socket.id)

    socket.on("send_message", (data) => {
        io.sockets.emit("receive_message", data)
    })

    socket.on("i-am-typing", (data) => {
        socket.broadcast.emit("another-user-typing", data)
    })

    socket.on("stopped-typing", () => {
        socket.broadcast.emit("user-stopped-typing")
    })
})
