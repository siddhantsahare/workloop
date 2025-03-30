import { push, ref, set, remove, serverTimestamp, off } from "firebase/database";
import { Segment, Button, Input, Progress, Icon } from "semantic-ui-react";
import { database } from "../../firebase";
import { useState, useEffect, useRef, useCallback } from "react";
import FileModal from "./FileModal";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

const MessageForm = ({ currentChannel, currentUser }) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [fileModal, setFileModal] = useState(false);
  const [percentUploaded, setPercentUploaded] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [emojiPicker, setEmojiPicker] = useState(false);
  const messageInputRef = useRef();

  // Firebase references stored in useRef to persist across renders
  const channelMessagesRef = useRef(null);
  const typingRef = useRef(null);

  useEffect(() => {
    if (currentChannel && currentUser) {
      channelMessagesRef.current = ref(database, `messages/${currentChannel.id}`);
      typingRef.current = ref(database, `typing/${currentChannel.id}/${currentUser.uid}`);
    }

    return () => {
      // Cleanup Firebase listeners on unmount
      if (channelMessagesRef.current) off(channelMessagesRef.current);
      if (typingRef.current) off(typingRef.current);
    };
  }, [currentChannel, currentUser]);

  const onHandleChange = (event) => {
    setMessage(event.target.value);
    if (typingRef.current) {
      set(typingRef.current, { user: currentUser.displayName });
    }
  };

  const onKeyDown = (event) => {
    if (event.ctrlKey && event.key === "Enter") {
      sendMessage();
    }
  };

  const createMessage = useCallback((imageData = null) => {
    return {
      timestamp: serverTimestamp(),
      user: {
        id: currentUser?.uid,
        name: currentUser?.displayName,
        avatar: currentUser?.photoURL,
      },
      ...(imageData ? { image: imageData } : { content: message }),
    };
  }, [currentUser, message]);

  const sendMessage = async () => {
    if (!message.trim()) {
      setErrors([...errors, { message: "Add a message" }]);
      return;
    }
    if (!channelMessagesRef.current) return;

    setLoading(true);
    try {
      const newMessageRef = push(channelMessagesRef.current);
      await set(newMessageRef, createMessage());

      setMessage("");
      setErrors([]);
      if (typingRef.current) remove(typingRef.current);
    } catch (err) {
      console.error(err);
      setErrors([...errors, err]);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        setPercentUploaded(Math.round((event.loaded / event.total) * 100));
      }
    };

    setUploading(true);
    reader.onloadend = async () => {
      await sendFileMessage(reader.result);
      setUploading(false);
      setPercentUploaded(0);
    };

    reader.onerror = (error) => {
      console.error("File reading error:", error);
      setErrors([...errors, error]);
      setUploading(false);
    };
  };

  const sendFileMessage = async (fileUrl) => {
    if (!channelMessagesRef.current) return;

    setLoading(true);
    try {
      const newMessageRef = push(channelMessagesRef.current);
      await set(newMessageRef, createMessage(fileUrl));
    } catch (err) {
      console.error(err);
      setErrors([...errors, err]);
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = () => {
    if (typingRef.current) remove(typingRef.current);
  };

  const handleTogglePicker = () => {
    setEmojiPicker((prev) => !prev);
  };

  const handleAddEmoji = (emoji) => {
    setMessage((prevMessage) => `${prevMessage} ${emoji.native} `);
    setEmojiPicker(false);
    setTimeout(() => messageInputRef.current?.focus(), 0);
  };

  return (
    <Segment className="message__form">
      {/* Emoji Picker */}
      {emojiPicker && (
        <div className="emoji-picker">
          <Picker data={data} onEmojiSelect={handleAddEmoji} />
        </div>
      )}

      <Input
        fluid
        ref={messageInputRef}
        value={message}
        placeholder="Write a message..."
        onChange={onHandleChange}
        onKeyDown={onKeyDown}
        onBlur={handleBlur}
        className="message__input"
        labelPosition="left"
        action
      >
        <Button
          icon={<Icon name={emojiPicker ? "close" : "smile outline"} />}
          onClick={handleTogglePicker}
          className="emoji-button"
        />
        <input />
        {/* Upload Button */}
        <Button
          icon="paperclip"
          color="grey"
          onClick={() => setFileModal(true)}
          disabled={uploading}
          className="upload-button"
        />
        {/* Send Button */}
        <Button
          icon="send"
          color="blue"
          disabled={!message.trim()}
          onClick={sendMessage}
          className="send-button"
        />
      </Input>

      <FileModal open={fileModal} closeModal={() => setFileModal(false)} uploadFile={uploadFile} />

      {/* Progress Bar */}
      {uploading && (
        <div className="progress-container">
          <progress value={percentUploaded} max="100" className="progress-bar" />
        </div>
      )}
    </Segment>
  );
};

export default MessageForm;
