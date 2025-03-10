import { Grid, Header, Icon, Dropdown } from "semantic-ui-react";
import { auth } from "../../firebase";
const UserPanel = () => {
    const handleSignout = async () => {
        await auth.signOut();
        console.log("signedOut");
    }
    
    const dropdownOptions = [
        {
            key: "user",
            text: (
              <span>
                Signed in as <strong>User</strong>
              </span>
            ),
            disabled: true
          },
          {
            key: "avatar",
            text: <span>Change Avatar</span>
          },
          {
            key: "signout",
            text: <span onClick={handleSignout}>Sign Out</span>
          }
    ];

    return (
        <Grid style={{ background: "#4c3c4c" }}>
            <Grid.Column>
            <Grid.Row style={{ padding: "1.2em", margin: 0 }}>
                {/* App Header */}
                <Header inverted floated="left" as="h2">
                <Icon name="comments" size="large" color="white" />
                <Header.Content>WorkLoop</Header.Content>
                </Header>
            </Grid.Row>

            {/* User Dropdown  */}
            <Header style={{ padding: "0.25em" }} as="h4" inverted>
                <Dropdown
                trigger={<span>User</span>}
                options={dropdownOptions}
                />
            </Header>
            </Grid.Column>
        </Grid>
    );
}

export default UserPanel;