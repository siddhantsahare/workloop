import { Fragment, useEffect, useState } from "react";
import { Segment, Comment } from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import Message from "./Message";
import { useSelector } from "react-redux";
import { off, onChildAdded, ref } from "firebase/database";
import { database } from "../../firebase";
import React from "react";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const currentChannel = useSelector((state) => state.channels.currentChannel);
  const currentUser = useSelector((state) => state.user.currentUser);
  const [channelMessagesRef, setChannelMessagesRef] = useState(null);

  useEffect(() => {
    if (currentChannel && currentUser) {
      setMessages([]);
      setMessagesLoading(true);
      const newRef = ref(database, `messages/${currentChannel.id}`);
      setChannelMessagesRef(newRef);
      addListeners(newRef);
    }
    return () => {
      if (channelMessagesRef) {
        off(channelMessagesRef); // Cleanup Firebase listener
        setChannelMessagesRef(null); // Reset state
      }
    };
  }, [currentChannel, currentUser]);

  const addListeners = (channelRef) => {
    const loadedMessages = [];
    onChildAdded(channelRef, (snap) => {
      loadedMessages.push(snap.val());
      setMessages([...loadedMessages]);
      setMessagesLoading(false);
    });
  };

  const displayMessages = (messages) =>
    messages.length
      ? messages.map((message) => (
          <Message
            key={message.timestamp}
            message={message}
            user={currentUser}
          />
        ))
      : null;

  return (
    <Fragment>
      <MessagesHeader />
      <Segment>
        <Comment.Group className="messages">
          {displayMessages(messages)}
        </Comment.Group>
      </Segment>
      <MessageForm currentChannel={currentChannel} currentUser={currentUser}/>
    </Fragment>
  );
};

export default Messages;
