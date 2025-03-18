import React, { useEffect, useState, useRef } from "react";
import { ref, set, update, push, onChildAdded, onValue, off } from "firebase/database";
import { Menu, Icon, Modal, Form, Input, Button, Label } from "semantic-ui-react";
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
  
  const channelsRef = ref(database, "channels");
  const messagesRef = ref(database, "messages");
  const currentUser = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();

  useEffect(() => {
    addListeners();
    return () => off(channelsRef);
  }, []);

  useEffect(() => {
    if (firstLoadRef.current && channels.length > 0) {
      dispatch(setCurrentChannel(channels[0]));
      setActiveChannel(channels[0]);
      firstLoadRef.current = false;
    }
  }, [channels]);

  const handleChange = (event) => {
    setChannel((prevState) => ({ ...prevState, [event.target.name]: event.target.value }));
  };

  const addChannel = async () => {
    try {
      const key = push(channelsRef).key;
      const newChannel = {
        id: key,
        name: channel.name,
        details: channel.details,
        createdBy: { name: currentUser.displayName, avatar: currentUser.photoURL },
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
        prevNotifications[index] = { ...prevNotifications[index], count: newCount > 0 ? newCount : 0, lastKnownTotal: snap.size };
      } else {
        prevNotifications.push({ id: channelId, total: snap.size, lastKnownTotal: snap.size, count: 0 });
      }
      return [...prevNotifications];
    });
  };

  const changeChannel = (channel) => {
    dispatch(setCurrentChannel(channel));
    dispatch(setPrivateChannel(false));
    clearNotifications(channel.id);
    setActiveChannel(channel);
  };

  const clearNotifications = (channelId) => {
    setNotifications((prevNotifications) => prevNotifications.map((n) => (n.id === channelId ? { ...n, total: n.lastKnownTotal, count: 0 } : n)));
  };

  const setActiveChannel = (channel) => {
    setActiveChannelId(channel.id);
  };

  const getNotificationCount = (channelId) => {
    const notification = notifications.find((n) => n.id === channelId);
    console.log("Notification", notification);
    return notification && notification.count > 0 ? notification.count : null;
  };

  const displayChannels = (channels) =>
    channels.length > 0 &&
    channels.map((channel) => (
      <Menu.Item key={channel.id} onClick={() => changeChannel(channel)} name={channel.name} active={channel.id === activeChannelId}>
        {getNotificationCount(channel.id) && <Label color="red">{getNotificationCount(channel.id)}</Label>}
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

      <Modal basic open={modal} onClose={() => setModal(false)}>
        <Modal.Header>Add a Channel</Modal.Header>
        <Modal.Content>
          <Form onSubmit={handleSubmit}>
            <Form.Field>
              <Input fluid label="Name of Channel" name="name" onChange={handleChange} />
            </Form.Field>
            <Form.Field>
              <Input fluid label="About the Channel" name="details" onChange={handleChange} />
            </Form.Field>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button color="green" inverted onClick={handleSubmit}>
            <Icon name="checkmark" /> Add
          </Button>
          <Button color="red" inverted onClick={() => setModal(false)}>
            <Icon name="remove" /> Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};

export default Channels;
