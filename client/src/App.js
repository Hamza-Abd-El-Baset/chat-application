import { useEffect, useState } from 'react';
import './App.css';
import io from "socket.io-client"

const socket = io.connect('http://localhost:5000')

function App() {

  const [msgToBeSent, setMsgToBeSent] = useState("")
  const [messages, setMessages] = useState([])
  const [sender, setSender] = useState("Sender")
  const [typing, setTyping] = useState({typer: "", state: false})

  const sendMessage = () => {
    socket.emit("send_message", {
      msg: msgToBeSent,
      sender
    })
    setMsgToBeSent("")
    setTyping({ typer: "", state: false });
    socket.emit("stopped-typing");
  }

  const handleTyping = () => {
    socket.emit("i-am-typing", {
      sender
    })
  }

  useEffect(() => {

    const handleMessageReceive = (data) => {
      console.log(data)
      setMessages((prevMessages) => [...prevMessages, data.sender+": "+data.msg])
    }

    socket.on("receive_message", handleMessageReceive)

    socket.on("another-user-typing", (data) => {
      setTyping({typer: data.sender, state: true})
    })

    socket.on("user-stopped-typing", () => {
      setTyping({typer: "", state: false})
    })

    return () => {
      socket.off("receive_message", handleMessageReceive)
    }
  }, [socket])

  const messagesList = messages?.map((message, index) => <h3 key={index}>{message}</h3>)

  return (
    <div className="App">
      <input onChange={(e) => setSender(e.target.value)} placeholder='Name'/>
      <input
        value={msgToBeSent}
        onChange={(e) => setMsgToBeSent(e.target.value)}
        onKeyDown={handleTyping} placeholder='Message...'
        onKeyUp={() => setTimeout(() => socket.emit("stopped-typing"), 5000)}
      />
      <button onClick={sendMessage}>Send Message</button>
      <h1>Messages:</h1>
      <div id="messages">{messagesList}</div>
      {typing.state && <div><img src="typing.gif" width="50px" alt="Typing Gif"/> {typing.typer} is typing now </div>}
    </div>
  );
}

export default App;
