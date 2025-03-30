import React, { useState } from "react";
import {
  Segment,
  Accordion,
  Header,
  Icon,
  Image,
  List,
} from "semantic-ui-react";
import { useSelector } from "react-redux";

const MetaPanel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const isPrivateChannel = useSelector(
    (state) => state.channels.isPrivateChannel
  );
  const currentChannel = useSelector((state) => state.channels.currentChannel);
  const userPosts = useSelector((state) => state.channels.userPosts);

  if (isPrivateChannel) return null; // Early return to avoid unnecessary rendering

  const handleSetActiveIndex = (event, { index }) => {
    setActiveIndex((prevIndex) => (prevIndex === index ? -1 : index));
  };
  const formatCount = num => (num > 1 || num === 0 ? `${num} posts` : `${num} post`);
  const displayTopPosters = () => {
    if (userPosts) {
      return Object.entries(userPosts)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5)
        .map(([name, value], index) => (
          <List.Item key={index}>
            <Image avatar src={value.avatar} />
            <List.Content>
              <List.Header as="a">{name}</List.Header>
              <List.Description>{formatCount(value.count)}</List.Description>
            </List.Content>
          </List.Item>
        ));
    }
  };

  return (
    <Segment loading={!currentChannel}>
      <Header as="h3" attached="top">
        About # {currentChannel && currentChannel.name}
      </Header>
      <Accordion styled attached="true">
        {/* Channel Details */}
        <Accordion.Title
          active={activeIndex === 0}
          index={0}
          onClick={handleSetActiveIndex}
        >
          <Icon name="dropdown" />
          <Icon name="info" />
          Channel Details
        </Accordion.Title>
        <Accordion.Content active={activeIndex === 0}>
          {currentChannel && currentChannel.details}
        </Accordion.Content>

        {/* Top Posters */}
        <Accordion.Title
          active={activeIndex === 1}
          index={1}
          onClick={handleSetActiveIndex}
        >
          <Icon name="dropdown" />
          <Icon name="user circle" />
          Top Posters
        </Accordion.Title>
        <Accordion.Content active={activeIndex === 1}>
          <List>{userPosts && displayTopPosters(userPosts)}</List>
        </Accordion.Content>

        {/* Created By */}
        <Accordion.Title
          active={activeIndex === 2}
          index={2}
          onClick={handleSetActiveIndex}
        >
          <Icon name="dropdown" />
          <Icon name="pencil alternate" />
          Created By
        </Accordion.Title>
        <Accordion.Content active={activeIndex === 2}>
          <Header as="h3">
            <Image
              circular
              src={currentChannel && currentChannel.createdBy.avatar}
            />
            {currentChannel && currentChannel.createdBy.name}
          </Header>
        </Accordion.Content>
      </Accordion>
    </Segment>
  );
};

export default MetaPanel;
