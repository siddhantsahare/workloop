import React, { useEffect, useState, useRef } from "react";
import {
  ref,
  set,
  update,
  push,
  onChildAdded,
  onValue,
  off,
} from "firebase/database";
import {
  Menu,
  Icon,
  Modal,
  Form,
  Input,
  Button,
  Label,
} from "semantic-ui-react";
import { useSelector, useDispatch } from "react-redux";
import { auth, database } from "../../firebase";
import { setCurrentChannel, setPrivateChannel } from "../../actions";

const Channels = () => {
  const [channels, setChannels] = useState([]);
  const [channel, setChannel] = useState({ name: "", details: "" });
  const [notifications, setNotifications] = useState([]);
  const [modal, setModal] = useState(false);
  const [activeChannelId, setActiveChannelId] = useState("");
  const firstLoadRef = useRef(true);
  const [typingRef, setTypingRef] = useState(null);

  const channelsRef = ref(database, "channels");
  const currentUser = useSelector((state) => state.user.currentUser);
  const currentChannel = useSelector((state) => state.channels.currentChannel);
  const activeSource = useSelector((state) => state.channels.activeSource);
  const dispatch = useDispatch();

  useEffect(() => {
    addListeners();
    return () => {
      off(channelsRef);
    }
  }, []);

  useEffect(() => {
    if (firstLoadRef.current && channels.length > 0) {
      dispatch(setCurrentChannel(channels[0], "channels"));
      setActiveChannel(channels[0]);
      clearNotifications(channels[0].id);
      firstLoadRef.current = false;
      if (currentChannel && currentUser) { 
        setTypingRef(ref(database, `typing/${currentChannel.id}/${currentUser.uid}`));
      }    
    }
  }, [channels, currentChannel, currentUser]);

  const handleChange = (event) => {
    setChannel((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }));
  };

  const addChannel = async () => {
    try {
      const key = push(channelsRef).key;
      const newChannel = {
        id: key,
        name: channel.name,
        details: channel.details,
        createdBy: {
          name: currentUser.displayName,
          avatar: currentUser.photoURL,
        },
      };

      await update(ref(database, `channels/${key}`), newChannel);
      setChannel({ name: "", details: "" });
      setModal(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (channel.name && channel.details) {
      addChannel();
    }
  };

  const addListeners = () => {
    let loadedChannels = [];
    onChildAdded(channelsRef, (snapshot) => {
      const newChannel = snapshot.val();
      loadedChannels.push(newChannel);
      setChannels([...loadedChannels]);
      addNotificationListener(newChannel.id);
    });
  };

  const addNotificationListener = (channelId) => {
    onValue(ref(database, `messages/${channelId}`), (snapshot) => {
      if (snapshot.exists()) {
        handleNotifications(channelId, snapshot);
      }
    });
  };

  const handleNotifications = (channelId, snap) => {
    setNotifications((prevNotifications) => {
      let lastTotal = 0;
      const index = prevNotifications.findIndex((n) => n.id === channelId);

      if (index !== -1) {
        lastTotal = prevNotifications[index].total;
        const newCount = snap.size - lastTotal;
        prevNotifications[index] = {
          ...prevNotifications[index],
          count: newCount > 0 ? newCount : 0,
          lastKnownTotal: snap.size,
        };
      } else {
        prevNotifications.push({
          id: channelId,
          total: snap.size,
          lastKnownTotal: snap.size,
          count: 0,
        });
      }
      return [...prevNotifications];
    });
  };

  const changeChannel = (channel) => {
    dispatch(setCurrentChannel(channel, "channels"));
    if (typingRef) remove(typingRef);
    dispatch(setPrivateChannel(false));
    setActiveChannel(channel);
    clearNotifications(channel.id);
  };

  const clearNotifications = (channelId) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((n) =>
        n.id === channelId ? { ...n, total: n.lastKnownTotal, count: 0 } : n
      )
    );
  };

  const setActiveChannel = (channel) => {
    setActiveChannelId(channel.id);
  };

  const getNotificationCount = (channelId) => {
    if (channelId === activeChannelId) return null; // Hide notification if it's the active channel
    const notification = notifications.find((n) => n.id === channelId);
    return notification && notification.count > 0 ? notification.count : null;
  };

  const displayChannels = (channels) =>
    channels.length > 0 &&
    channels.map((channel) => (
      <Menu.Item
        key={channel.id}
        onClick={() => changeChannel(channel)}
        name={channel.name}
        active={channel.id === activeChannelId && activeSource === "channels"}
      >
        {getNotificationCount(channel.id) && (
          <Label color="red">{getNotificationCount(channel.id)}</Label>
        )}
        # {channel.name}
      </Menu.Item>
    ));

  return (
    <>
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="exchange" /> CHANNELS
          </span>
          ({channels.length}) <Icon name="add" onClick={() => setModal(true)} />
        </Menu.Item>
        {displayChannels(channels)}
      </Menu.Menu>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        size="tiny"
        className="styled-modal"
      >
        <Modal.Header className="text-center text-xl font-semibold p-4 border-b">
          📢 Add a Channel
        </Modal.Header>
        <Modal.Content className="p-6">
          <Form onSubmit={handleSubmit}>
            <Form.Field className="mb-4">
              <label className="block text-gray-600 font-medium">
                Channel Name
              </label>
              <Input
                fluid
                placeholder="Enter channel name..."
                name="name"
                onChange={handleChange}
                className="rounded-lg p-2 border shadow-sm"
              />
            </Form.Field>
            <Form.Field className="mb-4">
              <label className="block text-gray-600 font-medium">
                About the Channel
              </label>
              <Input
                fluid
                placeholder="Describe the channel..."
                name="details"
                onChange={handleChange}
                className="rounded-lg p-2 border shadow-sm"
              />
            </Form.Field>
          </Form>
        </Modal.Content>
        <Modal.Actions className="flex justify-center gap-4 p-4 border-t">
          <Button
            color="green"
            className="rounded-lg px-4 py-2 shadow-md"
            onClick={handleSubmit}
          >
            <Icon name="checkmark" /> Add
          </Button>
          <Button
            color="red"
            className="rounded-lg px-4 py-2 shadow-md"
            onClick={() => setModal(false)}
          >
            <Icon name="remove" /> Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};

export default Channels;
