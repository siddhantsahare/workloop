import React, { useEffect, useState } from "react";
import { ref, push, update, onChildAdded, set } from "firebase/database";
import { Sidebar, Menu, Divider, Button, Modal, Icon, Label, Segment } from "semantic-ui-react";
import { SliderPicker } from "react-color";
import { useDispatch, useSelector } from "react-redux";
import { database } from "../../firebase";
import { motion } from "framer-motion";
import { setUserColors } from "../../actions";

const ColorPanel =  () => {
  const [modal, setModal] = useState(false);
  const [primary, setPrimary] = useState("");
  const [secondary, setSecondary] = useState("");
  const [colors, setColors] = useState([]);
  const currentUser = useSelector((state) => state.user.currentUser);
  const userColorsRef = ref(database, `users/${currentUser.uid}/colors`);
  const dispatch = useDispatch();
  
  useEffect(() => {
    if(currentUser){
      addListener();
    }
  }, [])
  
  const addListener = () => {
    let userColors = [];
    onChildAdded(userColorsRef, snap => {
      userColors.unshift(snap.val());
      setColors(userColors);
    })
  }
  
  const handleChangePrimary = (color) => setPrimary(color.hex);
  const handleChangeSecondary = (color) => setSecondary(color.hex);
  const handleSaveColors = async () => {
    if (primary && secondary) {
      try {
        await saveColors(primary, secondary);
        closeModal();
      } catch (error) {
        console.error("Error saving colors:", error);
      }
    }
  };

  const saveColors = async (primary, secondary) => {
    if (!currentUser) return;
  
    const newColorRef = push(userColorsRef); 
    await update(newColorRef, { primary, secondary });
    
    console.log("Colors added successfully");
  };

  const displayUserColors = colors =>
    colors.length > 0 &&
    colors.map((color, i) => (
      <React.Fragment key={i}>
        <Divider />
        <div
          className="color__container"
          onClick={() => dispatch(setUserColors(color.primary, color.secondary))}
        >
          <div className="color__square" style={{ background: color.primary }}>
            <div
              className="color__overlay"
              style={{ background: color.secondary }}
            />
          </div>
        </div>
      </React.Fragment>
    ));


  const openModal = () => setModal(true);
  const closeModal = () => setModal(false);

  return (
    <Sidebar as={Menu} icon="labeled" inverted vertical visible width="very thin">
      <Divider />
      <Button icon="add" size="small" color="blue" onClick={openModal} />
      {displayUserColors(colors)}
      {/* Fancy Animated Modal */}
      <Modal basic open={modal} onClose={closeModal}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Modal.Header style={{ textAlign: "center", fontSize: "1.5rem", marginBottom: '2rem' }}>
            🎨 Choose App Colors
          </Modal.Header>
          <Modal.Content>
            <Segment
              inverted
              style={{
                borderRadius: "15px",
                padding: "20px",
                background: "rgba(255, 255, 255, 0.2)",
                boxShadow: "0 4px 10px rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(8px)",
                textAlign: "center",
              }}
            >
              <Label
                content="Primary Color"
                style={{ fontSize: "1.2rem", marginBottom: "10px" }}
              />
              <SliderPicker color={primary} onChange={handleChangePrimary} styles={{ default: { hue: { cursor: "pointer" } } }}/>
            </Segment>

            <Segment
              inverted
              style={{
                borderRadius: "15px",
                padding: "20px",
                background: "rgba(255, 255, 255, 0.2)",
                boxShadow: "0 4px 10px rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(8px)",
                textAlign: "center",
                marginTop: "20px",
              }}
            >
              <Label
                content="Secondary Color"
                style={{ fontSize: "1.2rem", marginBottom: "10px" }}
              />
              <SliderPicker color={secondary} onChange={handleChangeSecondary} styles={{ default: { hue: { cursor: "pointer" } } }} />
            </Segment>
          </Modal.Content>
          <Modal.Actions style={{ textAlign: "center", paddingBottom: "20px", marginTop: '2rem' }}>
            <Button color="green" inverted onClick={handleSaveColors} size="large">
              <Icon name="checkmark" /> Save Colors
            </Button>
            <Button color="red" inverted onClick={closeModal} size="large">
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </motion.div>
      </Modal>
    </Sidebar>
  );
};

export default ColorPanel;
