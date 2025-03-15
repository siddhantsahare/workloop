import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Menu, Icon } from "semantic-ui-react";
import { database } from "../../firebase";
import { ref, onChildAdded, onValue, onChildRemoved, set, remove, onDisconnect, off } from "firebase/database";
import { setPrivateChannel, setCurrentChannel } from "../../actions";

const DirectMessages = () => {
  const currentUser = useSelector((state) => state.user.currentUser);
  const [users, setUsers] = useState([]);
  const dispatch = useDispatch();
  
  // Firebase refs
  const usersRef = useRef(ref(database, "users"));
  const presenceRef = useRef(ref(database, "presence"));
  const connectedRef = useRef(ref(database, ".info/connected"));

  // Add Listeners to Fetch Users
  const addListeners = useCallback((currentUserUid) => {
    let loadedUsers = [];

    // Listen for new users added to the "users" node
    const usersListener = onChildAdded(usersRef.current, (snap) => {
      if (currentUserUid !== snap.key) {
        let user = { ...snap.val(), uid: snap.key, status: "offline" };
        loadedUsers.push(user);
        setUsers((prevUsers) => [...prevUsers, user]); // Update users state
      }
    });

    // Track when the current user connects to Firebase
    const connectedListener = onValue(connectedRef.current, (snap) => {
      if (snap.val() === true) {
        const userStatusRef = ref(database, `presence/${currentUserUid}`);
        
        // Set user online
        set(userStatusRef, true)
          .then(() => onDisconnect(userStatusRef).remove()) // Remove only when the user disconnects
          .catch(console.error);
      }
    });

    // Handle when users come online
    const onlineListener = onChildAdded(presenceRef.current, (snap) => {
      if (currentUserUid !== snap.key) {
        console.log("User online:", snap.key);
        addStatusToUser(snap.key, true);
      }
    });

    // Handle when users go offline
    const offlineListener = onChildRemoved(presenceRef.current, (snap) => {
      if (currentUserUid !== snap.key) {
        console.log("User offline:", snap.key);
        addStatusToUser(snap.key, false);
      }
    });

    return () => {
      off(usersRef.current, "child_added", usersListener);
      off(connectedRef.current, "value", connectedListener);
      off(presenceRef.current, "child_added", onlineListener);
      off(presenceRef.current, "child_removed", offlineListener);
    };
  }, []);

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

  // Effect to set up and clean up listeners
  useEffect(() => {
    if (currentUser) {
      const removeListeners = addListeners(currentUser.uid);
      return removeListeners; // Cleanup function to remove listeners on unmount
    }
    return () => setUsers([]); // Reset users on unmount
  }, [currentUser, addListeners]);

  // Check if user is online
  const isUserOnline = (user) => user.status === "online";

  const getChannelId = (userId) => {
    return userId < currentUser.uid ? `${userId}/${currentUser.uid}` : `${currentUser.uid}/${userId}`;
  }
  const changeChannel = (user) => {
    const channelId = getChannelId(user.uid);
    const channelData = {
      id: channelId,
      name: user.name, 
    }
    dispatch(setCurrentChannel(channelData));
    dispatch(setPrivateChannel(true));
  }

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
        >
          <Icon name="circle" color={isUserOnline(user) ? "green" : "red"} />
          @ {user.name}
        </Menu.Item>
      ))}
    </Menu.Menu>
  );
};

export default DirectMessages;
