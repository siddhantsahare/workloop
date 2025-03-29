import { Menu, Icon } from "semantic-ui-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { onValue, ref } from "firebase/database";
import { setCurrentChannel, setPrivateChannel } from "../../actions";
import { database } from "../../firebase";

const Pinned = () => {
  const [pinnedChannels, setPinnedChannels] = useState([]);
  const [activeChannelId, setActiveChannelId] = useState("");
  const currentUser = useSelector((state) => state.user.currentUser);
  const activeSource = useSelector(state => state.channels.activeSource);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!currentUser) return;
    const pinnedRef = ref(database, `users/${currentUser.uid}/pinned`);
    const unsubscribe = onValue(pinnedRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const channelsArray = Object.keys(data).map((channelId) => ({
          id: channelId,
          ...data[channelId],
        }));
        setPinnedChannels(channelsArray);
      } else {
        setPinnedChannels([]);
      }
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [currentUser]);

  const displayChannels = (channels) =>
    channels.length > 0 &&
    channels.map((channel) => (
      <Menu.Item
        key={channel.id}
        onClick={() => changeChannel(channel)}
        name={channel.name}
        active={channel.id === activeChannelId && activeSource === 'pinned'}
      >
        # {channel.name}
      </Menu.Item>
    ));

  const changeChannel = (channel) => {
    setActiveChannel(channel);
    dispatch(setCurrentChannel(channel, "pinned"));
    dispatch(setPrivateChannel(false));
  };

  const setActiveChannel = (channel) => {
    setActiveChannelId(channel.id);
  };

  return (
    <Menu.Menu className="menu">
      <Menu.Item>
        <span>
          <Icon name="exchange" /> PINNED
        </span>
        ({pinnedChannels.length}){" "}
        <Icon name="add" onClick={() => setModal(true)} />
      </Menu.Item>
      {displayChannels(pinnedChannels)}
    </Menu.Menu>
  );
};

export default Pinned;
