import { push, ref, set, serverTimestamp } from "firebase/database";
import { Segment, Button, Input } from "semantic-ui-react";
import { database  } from "../../firebase";
import { useState } from "react";

const MessageForm = ({messagesRef, currentChannel, currentUser}) => {
  const [message, setMessage] =  useState("");
  const [loading, setLoading] =  useState(false);
  const [errors, setErrors] = useState([]);
  const onHandleChange = (event) => {
    setMessage(event.target.value);
  }
  const createMessage = () => {
    return {
      timestamp: serverTimestamp(),
      user: {
        id: currentUser?.uid,
        name: currentUser?.displayName,
        avatar: currentUser?.photoURL,
      },
      content: message
    }
  }

  const sendMessage = async () => {
    if (!message.trim()) {
      setErrors([...errors, { message: "Add a message" }]);
      return;
    }
    setLoading(true);
    try {
      const key = push(ref(database, `messages/${currentChannel.id}`)).key;
      await set(ref(database, `messages/${currentChannel.id}/${key}`), createMessage());
      console.log("success");
      setMessage("");
      setErrors([]);
    } catch (err) {
      console.log(err);
      setErrors([...errors, err])
    } finally {
      setLoading(false);
    }

  }
  return (
    <Segment className="message__form">
      <Input
        fluid
        name="message"
        style={{ marginBottom: "0.7em" }}
        label={<Button icon={"add"} />}
        value={message}
        labelPosition="left"
        placeholder="Write your message"
        onChange={onHandleChange}
        className={
          errors.some(err => err.message.includes("message")) ? 'error' : ""
        }
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
        />
      </Button.Group>
    </Segment>
  );
};

export default MessageForm;
