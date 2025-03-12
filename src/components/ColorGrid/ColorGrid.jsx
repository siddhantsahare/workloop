import { Sidebar, Menu, Divider, Button } from "semantic-ui-react"

const ColorGrid = () => {
  return (
    <Sidebar
      as={Menu}
      icon="labeled"
      inverted
      vertical
      visible
      width="very thin"
    >
      <Divider />
      <Button icon="add" size="small" color="blue" />
    </Sidebar>
  );
};

export default ColorGrid;
