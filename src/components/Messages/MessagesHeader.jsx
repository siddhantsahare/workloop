  import { useSelector } from "react-redux";
  import { Header, Segment, Input, Icon } from "semantic-ui-react";
  const MessagesHeader = ({
    currentChannel,
    numUniqueUsers,
    handleSearchChange,
    searchLoading,
    isChannelPinned,
    handlePinned
  }) => {
    const isPrivateChannel = useSelector(
      (state) => state.channels.isPrivateChannel
    );
    
    const displayChannelName = () => {
      return currentChannel
        ? `${isPrivateChannel ? "@" : "#"}${currentChannel.name}`
        : "";
    };
    return (
    <Segment clearing>
      {/* Channel Title */}
      <Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }}>
        <span>
          {displayChannelName()}
          {!isPrivateChannel && (
            <Icon
              name={isChannelPinned ? "star" : "star outline"}
              color={isChannelPinned ? 'yellow' : 'black'}
              style={{ marginLeft: "5px" }}
              onClick={handlePinned}
            />
          )}
        </span>
        <Header.Subheader>
          {!isPrivateChannel ? numUniqueUsers : "Private Channel"}
        </Header.Subheader>
      </Header>

      {/* Channel Search Input */}
      <Header floated="right">
        <Input
          loading={searchLoading}
          size="mini"
          icon="search"
          name="searchTerm"
          placeholder="Search Messages"
          onChange={handleSearchChange}
        />
      </Header>
    </Segment>
  );
};

export default MessagesHeader;
