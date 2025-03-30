import moment from "moment";
import { Comment } from "semantic-ui-react";
const Message = ({ message, user }) => {
  const isOwnMessage = (message, user) => {
    return message.user.id === user.uid ? "message__self" : "";
  };
  const timeFromNow = (timestamp) => moment(timestamp).fromNow();

  return (
    <Comment>
      <Comment.Avatar src={message.user.avatar} />
      <Comment.Content className={isOwnMessage(message, user)}>
        <Comment.Author as="a">{message.user.name}</Comment.Author>
        <Comment.Metadata>{timeFromNow(message.timestamp)}</Comment.Metadata>
        <Comment.Text>
          {message.image ? (
            <img
              src={message.image}
              alt="Uploaded file"
              style={{ maxWidth: "500px", borderRadius: "5px" }}
            />
          ) : (
            <p>{message.content}</p>
          )}
        </Comment.Text>
      </Comment.Content>
    </Comment>
  );
};

export default Message;
