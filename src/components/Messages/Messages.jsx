import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Segment, Comment } from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import Message from "./Message";
import { useDispatch, useSelector } from "react-redux";
import {
  get,
  off,
  onChildAdded,
  onChildRemoved,
  ref,
  remove,
  update,
  set,
  onValue,
  onDisconnect,
} from "firebase/database";
import { database } from "../../firebase";
import React from "react";
import debounce from "lodash.debounce";
import { setUserPosts } from "../../actions";
import Typing from "./Typing";
import Skeleton from "./Skeleton";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [numUniqueUsers, setNumUniqueUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [isChannelPinned, setIsChannelPinned] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  const currentChannel = useSelector((state) => state.channels.currentChannel);
  const currentUser = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const [userPosts, setUserPostsState] = useState({});
  
  // Store Firebase references in refs to persist across renders
  const messagesRef = useRef(null);
  const typingRef = useRef(null);
  const connectedRef = useRef(ref(database, ".info/connected"));
  const userTypingRef = useRef(null);

  useEffect(() => {
    if (currentChannel && currentUser) {
      setMessages([]);
      setMessagesLoading(true);
      messagesRef.current = ref(database, `messages/${currentChannel.id}`);
      addListeners(messagesRef.current);
      fetchPinnedState();
    }

    return () => {
      if (messagesRef.current) {
        off(messagesRef.current);
        messagesRef.current = null;
      }
      removeTypingListeners();
    };
  }, [currentChannel, currentUser]);

  useEffect(() => {
    countUniqueUsers(messages);
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    filterMessages(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (Object.keys(userPosts).length > 0) {
      dispatch(setUserPosts(userPosts));
    }
  }, [userPosts, dispatch]);

  useEffect(() => {
    pinnedChannel();
  }, [isChannelPinned]);

  const addListeners = (channelRef) => {
    onChildAdded(channelRef, (snap) => {
      setMessages((prevMessages) => {
        const newMessage = snap.val();
        if (!prevMessages.some((msg) => msg.timestamp === newMessage.timestamp)) {
          const updatedMessages = [...prevMessages, newMessage];
          countUniqueUsers(updatedMessages);
          countUserPosts(updatedMessages);
          return updatedMessages;
        }
        return prevMessages;
      });
      setMessagesLoading(false);
    });

    addTypingListeners();
  };

  const addTypingListeners = () => {
    if (!currentChannel || !currentUser) return;

    typingRef.current = ref(database, `typing/${currentChannel.id}`);
    userTypingRef.current = ref(database, `typing/${currentChannel.id}/${currentUser.uid}`);

    // Listen for users starting to type
    onChildAdded(typingRef.current, (snap) => {
      if (snap.key !== currentUser.uid) {
        setTypingUsers((prevTypingUsers) => [...prevTypingUsers, { id: snap.key, name: snap.val() }]);
      }
    });

    // Listen for users stopping typing
    onChildRemoved(typingRef.current, (snap) => {
      setTypingUsers((prevTypingUsers) => prevTypingUsers.filter((user) => user.id !== snap.key));
    });

    // Handle disconnect event
    onValue(connectedRef.current, (snap) => {
      if (snap.val() === true) {
        onDisconnect(userTypingRef.current).remove().catch((err) => {
          if (err) console.error("Error removing typing status on disconnect:", err);
        });
      }
    });
  };

  const removeTypingListeners = () => {
    if (typingRef.current) {
      off(typingRef.current);
      typingRef.current = null;
    }
    if (connectedRef.current) {
      off(connectedRef.current);
    }
    if (userTypingRef.current) {
      off(userTypingRef.current);
      userTypingRef.current = null;
    }
  };

  const countUniqueUsers = (messages) => {
    const uniqueUsers = new Set(messages.map((message) => message.user?.name).filter(Boolean));
    const plural = uniqueUsers.size !== 1;
    setNumUniqueUsers(`${uniqueUsers.size} user${plural ? "s" : ""}`);
  };

  const displayMessages = (messages) =>
    messages.length
      ? messages.map((message) => <Message key={message.timestamp} message={message} user={currentUser} />)
      : null;

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.trim());
  };

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
              (message) => regex.test(message.content || "") || regex.test(message.user?.name || "")
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
    setIsChannelPinned((prev) => !prev);
  };

  const pinnedChannel = async () => {
    if (!currentChannel || !currentUser) return;
    try {
      if (isChannelPinned) {
        await update(ref(database, `users/${currentUser.uid}/pinned`), {
          [currentChannel.id]: {
            name: currentChannel.name,
            details: currentChannel.details,
            createdBy: {
              name: currentChannel.createdBy.name,
              avatar: currentChannel.createdBy.avatar,
            },
          },
        });
      } else {
        await remove(ref(database, `users/${currentUser.uid}/pinned/${currentChannel.id}`));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const countUserPosts = (messages) => {
    let userPosts = messages.reduce((acc, message) => {
      if (message.user.name in acc) {
        acc[message.user.name].count += 1;
      } else {
        acc[message.user.name] = {
          avatar: message.user.avatar,
          count: 1,
        };
      }
      return acc;
    }, {});
    setUserPostsState(userPosts);
  };

  return (
    <Fragment>
      <MessagesHeader currentChannel={currentChannel} numUniqueUsers={numUniqueUsers} handleSearchChange={handleSearchChange} searchLoading={searchTerm.length > 0 && filteredMessages.length === 0} handlePinned={handlePinned} isChannelPinned={isChannelPinned} />
      <Segment>
        <Comment.Group className="messages">
          {messagesLoading && [...Array(10)].map((_, i) => <Skeleton key={i} />)}
          {displayMessages(searchTerm ? filteredMessages : messages)}
          <div ref={messagesEndRef} />
        </Comment.Group>
      </Segment>
      <MessageForm currentChannel={currentChannel} currentUser={currentUser} />
    </Fragment>
  );
};

export default Messages;
