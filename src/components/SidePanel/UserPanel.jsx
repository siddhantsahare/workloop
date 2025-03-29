import { Grid, Header, Icon, Dropdown, Image } from "semantic-ui-react";
import { auth, database } from "../../firebase";
import { useSelector } from "react-redux";
import { ref, remove } from "firebase/database";
const UserPanel = () => {
  const user = useSelector((state) => state.user.currentUser);
  const primaryColor = useSelector(state => state.colors.primaryColor);
  const handleSignout = async () => {
    const user = auth.currentUser;
    if (user) {
      const presenceRef = ref(database, `presence/${user.uid}`);
      await remove(presenceRef); // Correct way to remove a reference in Firebase v9+
    }
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
    <Grid style={{ background: primaryColor }}>
      <Grid.Column>
        <Grid.Row style={{ padding: "1.2em", margin: 0 }}>
          {/* App Header */}
          <Header inverted floated="left" as="h2">
            <Icon name="users" />
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
