import { push, ref, set, serverTimestamp } from "firebase/database";
import { Segment, Button, Input, Progress } from "semantic-ui-react";
import { database } from "../../firebase";
import { useState, useEffect } from "react";
import FileModal from "./FileModal";

const MessageForm = ({ currentChannel, currentUser }) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [fileModal, setFileModal] = useState(false);
  const [channelMessagesRef, setChannelMessagesRef] = useState(null);
  const [percentUploaded, setPercentUploaded] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (currentChannel) {
      setChannelMessagesRef(ref(database, `messages/${currentChannel.id}`));
    }
    return () => setChannelMessagesRef(null); // Cleanup on unmount
  }, [currentChannel]);

  const onHandleChange = (event) => {
    setMessage(event.target.value);
  };

  const createMessage = (imageData = null) => {
    const newMessage = {
      timestamp: serverTimestamp(),
      user: {
        id: currentUser?.uid,
        name: currentUser?.displayName,
        avatar: currentUser?.photoURL,
      },
    };

    if (imageData) {
      newMessage.image = imageData; // Storing Base64 image
    } else {
      newMessage.content = message;
    }

    return newMessage;
  };

  const openModal = () => setFileModal(true);
  const closeModal = () => setFileModal(false);

  const sendMessage = async () => {
    if (!message.trim()) {
      setErrors([...errors, { message: "Add a message" }]);
      return;
    }
    if (!channelMessagesRef) return;

    setLoading(true);
    try {
      const newMessageRef = push(channelMessagesRef);
      await set(newMessageRef, createMessage());
      setMessage("");
      setErrors([]);
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
        const progress = Math.round((event.loaded / event.total) * 100);
        setPercentUploaded(progress);
      }
    };

    setUploading(true);
    reader.onloadend = async () => {
      const base64Data = reader.result;
      await sendFileMessage(base64Data);
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
    if (!channelMessagesRef) return;

    setLoading(true);
    try {
      const newMessageRef = push(channelMessagesRef);
      await set(newMessageRef, createMessage(fileUrl));
    } catch (err) {
      console.error(err);
      setErrors([...errors, err]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Segment className="message__form">
      <Input
        fluid
        name="message"
        style={{ marginBottom: "0.7em" }}
        label={<Button icon="add" />}
        value={message}
        labelPosition="left"
        placeholder="Write your message"
        onChange={onHandleChange}
        className={errors.some((err) => err.message.includes("message")) ? "error" : ""}
      />
      <Button.Group icon widths="2">
        <Button
          color="teal"
          content="Add Reply"
          labelPosition="left"
          icon="edit"
          disabled={loading}
          onClick={sendMessage}
        />
        <Button
          color="orange"
          content="Upload Media"
          labelPosition="right"
          icon="cloud upload"
          onClick={openModal}
        />
        <FileModal open={fileModal} closeModal={closeModal} uploadFile={uploadFile} />
      </Button.Group>

      {uploading && (
        <Progress
          percent={percentUploaded}
          progress
          indicating
          size="small"
          color="green"
          style={{ marginTop: "10px" }}
        />
      )}
    </Segment>
  );
};

export default MessageForm;
