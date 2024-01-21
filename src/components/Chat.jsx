import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import EmojiPicker from 'emoji-picker-react';
import io from 'socket.io-client';
import styles from '../styles/Chat.module.css';
import icon from '../images/emoji.svg';
import Messages from './Messages';

const socket = io.connect("https://chat-nu9b.onrender.com");

const Chat = () => {
  const [state, setState] = useState([]);
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { search } = useLocation();
  const [params, setParams] = useState({ room: "", user: "" });
  const [users, setUsers] = useState(0);
  const navigate = useNavigate();
  const messagesRef = useRef(null);

  useEffect(() => {
    const searchParams = Object.fromEntries(new URLSearchParams(search));
    setParams(searchParams);
    socket.emit('join', searchParams)
  }, [search])

  useEffect(() => {
    socket.on('message', ({ data }) => {
      setState((state) => [...state, data])
      console.log(data);
    })
  }, [])

  useEffect(() => {
    socket.on('room', ({ data: { users } }) => {
      setUsers(users.length);
    })
  }, [])

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [state])

  const leftRoom = () => { 
    socket.emit("leftRoom", { params })
    navigate("/")
  };

  const handleChange = ({ target: { value } }) => setMessage(value);

  const onEmojiClick = ({ emoji }) => setMessage(`${message} ${emoji}`);

  const handleSubmit = (e) => { 
    e.preventDefault();

    if (!message) return;

    socket.emit('sendMessage', { message, params });

    setMessage("");
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.title}>
          {params.room}
        </div>

        <div className={styles.users}>
          {`${users} users in this room`}
        </div>

        <button className={styles.left} onClick={leftRoom}>
          Leave the room
        </button>
      </div>

      <div className={styles.messages} ref={messagesRef}>
        <Messages messages={state} name={params.name} />
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.input}>
          <input
            type="text"
            name="name"
            value={message}
            placeholder="What do you want to say?"
            autoComplete="off"
            required
            onChange={handleChange}
          />
        </div>

        <div className={styles.emoji}>
          <img src={icon} alt="" onClick={() => setIsOpen((current) => !current)} />

          {isOpen && (
            <div className={styles.emojies}>
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}
        </div>

        <button className={styles.button}>
          <input type="submit" onSubmit={handleSubmit} value="Send a message" />
        </button>
      </form>
    </div>
  );
};

export default Chat;