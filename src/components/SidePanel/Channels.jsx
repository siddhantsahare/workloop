import React, { useEffect, useState, useRef } from "react";
import { ref, set, update, push, onChildAdded, off } from "firebase/database";
import {
  Menu,
  Icon,
  Modal,
  Form,
  Input,
  Button,
  Segment,
  Divider,
} from "semantic-ui-react";
import { useSelector, useDispatch } from "react-redux";
import { auth, database } from "../../firebase";
import { setCurrentChannel } from "../../actions";

const Channels = () => {
  const [channels, setChannels] = useState([]);
  const [channel, setChannel] = useState({
    name: "",
    details: "",
  });
  const [modal, setModal] = useState(false);
  const [activeChannelId, setActiveChannelId] = useState("");
  const firstLoadRef = useRef(true);
  // channels listner
  const channelsRef = ref(database, "channels");
  const currentUser = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();

  useEffect(() => {
    addListeners();
    return () => off(channelsRef); // Cleanup Firebase listener
  }, []);

  
  useEffect(() => {
    // separated only because it is a sideeffect
    if (firstLoadRef.current && channels.length > 0) {
      dispatch(setCurrentChannel(channels[0]));
      setActiveChannel(channels[0])
      firstLoadRef.current = false; // Prevent further executions
    }
  }, [channels]); // Runs only when `channels` updates

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
      setChannel({
        name: "",
        details: "",
      });
      setModal(false);
      console.log("channel added");
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isValid(channel)) {
      addChannel();
    }
  };

  const addListeners = () => {
    let loadedChannels = [];
    onChildAdded(channelsRef, (snapshot) => {
      loadedChannels.push(snapshot.val());
      // important concept: React might not trigger a re-render because loadedChannels is a direct reference to the same array in memory,
      // [...] creates a new array with the same contents since it's a new reference, React recognizes the state as updated and triggers a re-render.
      setChannels([...loadedChannels]);
    });
  };

  const changeChannel = channel => {
    dispatch(setCurrentChannel(channel));
    setActiveChannel(channel);
  }

  const setActiveChannel = channel => {
    setActiveChannelId(channel.id);
  }

  const displayChannels = (channels) => {
    return (channels.length > 0 &&
      channels.map((channel) => (
        <Menu.Item
          key={channel.id}
          onClick={() => changeChannel(channel)}
          name={channel.name}
          style={{ opacity: 0.7 }}
          active={activeChannelId === channel.id}
        >
          # {channel.name}
        </Menu.Item>
      ))
  )};

  const isValid = (channel) => channel.name && channel.details;

  return (
    <>
      <Menu.Menu style={{ paddingBottom: "2em" }}>
        <Menu.Item>
          <span>
            <Icon name="exchange" /> CHANNELS
          </span>{" "}
          ({channels.length}) <Icon name="add" onClick={() => setModal(true)} />
        </Menu.Item>
        {displayChannels(channels)}
      </Menu.Menu>

      {/* Add Channel Modal */}
      <Modal open={modal} onClose={() => setModal(false)} size="tiny">
        <Segment padded>
          <Modal.Header>
            <Icon name="plus circle" /> Add a Channel
          </Modal.Header>
          <Divider />
          <Modal.Content>
            <Form onSubmit={handleSubmit}>
              <Form.Field>
                <Input
                  fluid
                  label="Name of Channel"
                  name="name"
                  value={channel.name}
                  onChange={handleChange}
                />
              </Form.Field>

              <Form.Field>
                <Input
                  fluid
                  label="About the Channel"
                  name="details"
                  value={channel.details}
                  onChange={handleChange}
                />
              </Form.Field>
            </Form>
          </Modal.Content>
          <Divider />
          <Modal.Actions>
            <Button color="green" onClick={handleSubmit}>
              <Icon name="checkmark" /> Add
            </Button>
            <Button color="red" onClick={() => setModal(false)}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Segment>
      </Modal>
    </>
  );
};

export default Channels;
