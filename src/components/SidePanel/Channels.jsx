import React, { useState } from "react";
import { Menu, Icon, Modal, Form, Input, Button, Segment, Divider } from "semantic-ui-react";

const Channels = () => {
  const [channels, setChannels] = useState([]);
  const [channel, setChannel] = useState({
    name: "",
    details: "",
  });
  const [modal, setModal] = useState(false);

  const handleChange = (event) => {
    setChannel((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }))
  };

  return (
    <>
      <Menu.Menu style={{ paddingBottom: "2em" }}>
        <Menu.Item>
          <span>
            <Icon name="exchange" /> CHANNELS
          </span>{" "}
          ({channels.length}) <Icon name="add" onClick={() => setModal(true)} />
        </Menu.Item>
      </Menu.Menu>

      {/* Add Channel Modal */}
      <Modal open={modal} onClose={() => setModal(false)} size="tiny">
        <Segment padded>
          <Modal.Header>
            <Icon name="plus circle" /> Add a Channel
          </Modal.Header>
          <Divider />
          <Modal.Content>
            <Form>
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
            <Button color="green" onClick={() => setModal(false)}>
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
