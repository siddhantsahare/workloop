import { Menu } from "semantic-ui-react";
import UserPanel from "./UserPanel";
import Channels from "./Channels";
import DirectMessages from "./DirectMessages";
import Pinned from "./Pinned";
import { useSelector } from "react-redux";

const SidePanel = ()  => {

    const primaryColor = useSelector(state => state.colors.primaryColor);
    return (
        <Menu
        size="large"
        inverted
        fixed="left"
        vertical
        style={{ background: primaryColor, fontSize: "1.2rem" }}
      >
        <UserPanel />
        <Pinned />
        <Channels />
        <DirectMessages />
      </Menu>
    );
}

export default SidePanel;