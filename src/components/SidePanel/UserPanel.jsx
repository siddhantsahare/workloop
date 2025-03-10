import { Grid, Header, Icon, Dropdown, Image } from "semantic-ui-react";
import { auth } from "../../firebase";
import { useSelector } from "react-redux";
const UserPanel = () => {
  const user = useSelector((state) => state.user.currentUser);
  const handleSignout = async () => {
    await auth.signOut();
  };

  const dropdownOptions = [
    {
      key: "user",
      text: (
        <span>
          Signed in as <strong>{user ? user.displayName : "User"}</strong>
        </span>
      ),
      disabled: true,
    },
    {
      key: "avatar",
      text: <span>Change Avatar</span>,
    },
    {
      key: "signout",
      text: <span onClick={handleSignout}>Sign Out</span>,
    },
  ];

  return (
    <Grid style={{ background: "#4c3c4c" }}>
      <Grid.Column>
        <Grid.Row style={{ padding: "1.2em", margin: 0 }}>
          {/* App Header */}
          <Header inverted floated="left" as="h2">
            <Icon name="users" color="white" />
            <Header.Content>WorkLoop</Header.Content>
          </Header>
          {/* User Dropdown  */}
          <Header style={{ padding: "0.25em"}} as="h4" inverted>
            <Dropdown
              trigger={
                <span>
                  <Image src={user.photoURL} spaced="right" avatar></Image>
                  {user ? user.displayName : "User"}
                </span>
              }
              options={dropdownOptions}
            />
          </Header>
        </Grid.Row>
      </Grid.Column>
    </Grid>
  );
};

export default UserPanel;
