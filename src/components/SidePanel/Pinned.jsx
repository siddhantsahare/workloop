import { Menu, Icon } from "semantic-ui-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { onValue, ref, off } from "firebase/database";
import { setCurrentChannel, setPrivateChannel } from "../../actions";
import { database } from "../../firebase";

const Pinned = () => {
  const [pinnedChannels, setPinnedChannels] = useState([]);
  const [activeChannelId, setActiveChannelId] = useState("");
  const currentUser = useSelector((state) => state.user.currentUser);
  const activeSource = useSelector((state) => state.channels.activeSource);
  const dispatch = useDispatch();
  const pinnedRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;

    pinnedRef.current = ref(database, `users/${currentUser.uid}/pinned`);

    const listener = onValue(pinnedRef.current, (snapshot) => {
      const data = snapshot.val();
      setPinnedChannels(data ? Object.keys(data).map((id) => ({ id, ...data[id] })) : []);
    });

    return () => {
      if (pinnedRef.current) off(pinnedRef.current);
    };
  }, [currentUser]);

  const changeChannel = (channel) => {
    setActiveChannelId(channel.id);
    dispatch(setCurrentChannel(channel, "pinned"));
    dispatch(setPrivateChannel(false));
  };
  
  const displayChannels = (channels) =>
    channels.length > 0 &&
    channels.map((channel) => (
      <Menu.Item
        key={channel.id}
        onClick={() => changeChannel(channel)}
        name={channel.name}
        active={channel.id === activeChannelId && activeSource === "pinned"}
      >
        # {channel.name}
      </Menu.Item>
    ));
  
  return (
    <Menu.Menu className="menu">
      <Menu.Item>
        <span>
          <Icon name="exchange" /> PINNED
        </span>
        ({pinnedChannels.length}) <Icon name="pin" />
      </Menu.Item>
      {displayChannels(pinnedChannels)}
    </Menu.Menu>
  );
};

export default Pinned;
