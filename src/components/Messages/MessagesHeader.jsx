import { useEffect } from "react";
import { Header, Segment, Input, Icon } from "semantic-ui-react";
const MessagesHeader = ({currentChannel, numUniqueUsers, handleSearchChange, searchLoading}) => {

  useEffect(() => {
    console.log("Search loading state:", searchLoading);
  }, [searchLoading]);
  return (
    <Segment clearing>
      {/* Channel Title */}
      <Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }}>
        <span>
          {`# ${currentChannel && currentChannel.name}`}
          <Icon name={"star outline"} color="black" style={{marginLeft: '5px'}}/>
        </span>
        <Header.Subheader>{numUniqueUsers}</Header.Subheader>
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
