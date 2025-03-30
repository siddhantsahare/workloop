import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Menu, Icon } from "semantic-ui-react";
import { database } from "../../firebase";
import {
  ref,
  onChildAdded,
  onValue,
  onChildRemoved,
  set,
  onDisconnect,
  off,
} from "firebase/database";
import { setPrivateChannel, setCurrentChannel } from "../../actions";

const DirectMessages = () => {
  const currentUser = useSelector((state) => state.user.currentUser);
  const activeSource = useSelector((state) => state.channels.activeSource);
  const [users, setUsers] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const dispatch = useDispatch();

  // Firebase refs
  const usersRef = useRef(ref(database, "users"));
  const presenceRef = useRef(ref(database, "presence"));
  const connectedRef = useRef(ref(database, ".info/connected"));

  const isPrivateChannel = useSelector(
    (state) => state.channels.isPrivateChannel
  );

  // Avoid duplicate listener initialization
  const listenersInitializedRef = useRef(false);

  // Update user status (online/offline)
  const addStatusToUser = (userId, isConnected) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.uid === userId
          ? { ...user, status: isConnected ? "online" : "offline" }
          : user
      )
    );
  };  

  // Add Listeners to Fetch Users
  useEffect(() => {
    if (!currentUser || listenersInitializedRef.current) return;

    listenersInitializedRef.current = true;

    // Listen for new users added to the "users" node
    const usersListener = onChildAdded(usersRef.current, (snap) => {
      if (currentUser.uid !== snap.key) {
        let user = { ...snap.val(), uid: snap.key, status: "offline" };

        // Prevent duplicates
        setUsers((prevUsers) =>
          prevUsers.some((u) => u.uid === user.uid)
            ? prevUsers
            : [...prevUsers, user]
        );
      }
    });

    // Track when the current user connects to Firebase
    const connectedListener = onValue(connectedRef.current, (snap) => {
      if (snap.val() === true) {
        const userStatusRef = ref(database, `presence/${currentUser.uid}`);
        set(userStatusRef, true)
          .then(() => onDisconnect(userStatusRef).remove())
          .catch(console.error);
      }
    });

    // Handle users going online/offline
    const onlineListener = onChildAdded(presenceRef.current, (snap) => {
      if (currentUser.uid !== snap.key) {
        addStatusToUser(snap.key, true);
      }
    });

    const offlineListener = onChildRemoved(presenceRef.current, (snap) => {
      if (currentUser.uid !== snap.key) {
        addStatusToUser(snap.key, false);
      }
    });

    return () => {
      off(usersRef.current, "child_added", usersListener);
      off(connectedRef.current, "value", connectedListener);
      off(presenceRef.current, "child_added", onlineListener);
      off(presenceRef.current, "child_removed", offlineListener);
      listenersInitializedRef.current = false;
    };
  }, [currentUser, addStatusToUser]);

  // Check if user is online
  const isUserOnline = (user) => user.status === "online";

  const getChannelId = (userId) => {
    return userId < currentUser.uid
      ? `${userId}/${currentUser.uid}`
      : `${currentUser.uid}/${userId}`;
  };

  const changeChannel = useCallback(
    (user) => {
      const channelId = getChannelId(user.uid);
      const channelData = {
        id: channelId,
        name: user.name,
      };
      dispatch(setCurrentChannel(channelData, "directMessages"));
      dispatch(setPrivateChannel(true));
      setActiveChannel(user.uid);
    },
    [dispatch, currentUser]
  );

  return (
    <Menu.Menu className="menu">
      <Menu.Item>
        <span>
          <Icon name="mail" /> DIRECT MESSAGES
        </span>{" "}
        ({users.length})
      </Menu.Item>

      {users.map((user) => (
        <Menu.Item
          key={user.uid}
          onClick={() => changeChannel(user)}
          style={{ opacity: 0.7, fontStyle: "italic" }}
          active={
            isPrivateChannel &&
            activeChannel === user.uid &&
            activeSource === "directMessages"
          }
        >
          <Icon name="circle" color={isUserOnline(user) ? "green" : "red"} />@
          {user.name}
        </Menu.Item>
      ))}
    </Menu.Menu>
  );
};

export default DirectMessages;
