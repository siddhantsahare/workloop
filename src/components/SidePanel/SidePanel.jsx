import { Menu } from "semantic-ui-react";
import UserPanel from "./UserPanel";
import Channels from "./Channels";
import DirectMessages from "./DirectMessages";

const SidePanel = ()  => {
    return (
        <Menu
        size="large"
        inverted
        fixed="left"
        vertical
        style={{ background: "#4c3c4c", fontSize: "1.2rem" }}
      >
        <UserPanel />
        <Channels />
        <DirectMessages />
      </Menu>
    );
}

export default SidePanel;