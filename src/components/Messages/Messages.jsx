import { Fragment } from "react";
import { Segment, Comment } from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";


const Messages = () => {
  return (
    <Fragment>
      <MessagesHeader />
      <Segment>
        <Comment.Group className="messages">{/* Messages */}</Comment.Group>
      </Segment>

      <MessageForm />
    </Fragment>
  );
};

export default Messages;
