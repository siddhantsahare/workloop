import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Segment, Comment } from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import Message from "./Message";
import { useSelector } from "react-redux";
import { get, off, onChildAdded, ref, remove, update } from "firebase/database";
import { database } from "../../firebase";
import React from "react";
import debounce from "lodash.debounce"; 

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [channelMessagesRef, setChannelMessagesRef] = useState(null);
  const [numUniqueUsers, setNumUniqueUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMessages, setFilteredMessages] = useState(false);
  const [isChannelPinned, setIsChannelPinned] = useState(false);
  const currentChannel = useSelector((state) => state.channels.currentChannel);
  const currentUser = useSelector((state) => state.user.currentUser);
  const searchLoading = searchTerm.length > 0 && filteredMessages.length === 0;

  useEffect(() => {
    if (currentChannel && currentUser) {
      setMessages([]);
      setMessagesLoading(true);
      const newRef = ref(database, `messages/${currentChannel.id}`);
      setChannelMessagesRef(newRef);
      addListeners(newRef);
      fetchPinnedState(); 
    }
    return () => {
      if (channelMessagesRef) {
        off(channelMessagesRef); // Cleanup Firebase listener
        setChannelMessagesRef(null); // Reset state
      }
    };
  }, [currentChannel, currentUser]);

  useEffect(() => {
    countUniqueUsers(messages);
  }, [messages]);

  
  useEffect(() => {
    filterMessages(searchTerm);
  }, [searchTerm]);

  
  useEffect(() => {
    pinnedChannel();
  }, [isChannelPinned]);

  const addListeners = (channelRef) => {
    const loadedMessages = [];

    onChildAdded(channelRef, (snap) => {
      loadedMessages.push(snap.val());

      // Batch update messages using functional setState
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, snap.val()];
        countUniqueUsers(updatedMessages);
        return updatedMessages;
      });

      setMessagesLoading(false);
    });
  };

  const countUniqueUsers = (messages) => {
    const uniqueUsers = new Set(
      messages.map((message) => message.user?.name).filter(Boolean)
    );
    const plural = uniqueUsers.size > 1 || uniqueUsers.size === 0;
    const numUniqueUsers = `${uniqueUsers.size} user${plural ? "s" : ""}`;
    setNumUniqueUsers(numUniqueUsers);
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

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.trim());
  };

  // Debounced function to filter messages
  const filterMessages = useMemo(
    () =>
      debounce((term) => {
        if (!term) {
          setFilteredMessages([]);
          return;
        }

        try {
          const regex = new RegExp(term, "gi");
          setFilteredMessages(
            messages.filter(
              (message) =>
                regex.test(message.content || "") ||
                regex.test(message.user?.name || "")
            )
          );
        } catch (error) {
          console.error(error);
        }
      }, 300),
    [messages]
  );


  const fetchPinnedState = async () => {
      const pinnedRef = ref(database, `users/${currentUser.uid}/pinned/${currentChannel.id}`);
      try {
        const snapshot = await get(pinnedRef);
        setIsChannelPinned(snapshot.exists());
      } catch (error) {
        console.error("Error fetching pinned state:", error);
      }
  };

  const handlePinned = () => {
    setIsChannelPinned(prev => !prev);
  }

  const pinnedChannel = async () => {
    if (!currentChannel || !currentUser) return; 
    try {
      if(isChannelPinned){
        await update(ref(database, `users/${currentUser.uid}/pinned`), {
          [currentChannel.id]: {
            name: currentChannel.name,
            details: currentChannel.details,
            createdBy: {
              name: currentChannel.createdBy.name,
              avatar: currentChannel.createdBy.avatar,
            }
          }
        });
      } else {
        await remove(ref(database, `users/${currentUser.uid}/pinned/${currentChannel.id}`));
      }
    }catch(err) {
      console.log(err);
    }
  }



  return (
    <Fragment>
      <MessagesHeader
        currentChannel={currentChannel}
        numUniqueUsers={numUniqueUsers}
        handleSearchChange={handleSearchChange}
        searchLoading={searchLoading}
        handlePinned={handlePinned}
        isChannelPinned={isChannelPinned}
      />
      <Segment>
        <Comment.Group className="messages">
          {searchTerm
            ? displayMessages(filteredMessages)
            : displayMessages(messages)}
        </Comment.Group>
      </Segment>
      <MessageForm currentChannel={currentChannel} currentUser={currentUser} />
    </Fragment>
  );
};

export default Messages;
