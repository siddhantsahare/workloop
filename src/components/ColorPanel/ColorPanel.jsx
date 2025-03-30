import React, { useEffect, useState, useRef, useCallback } from "react";
import { ref, push, update, onChildAdded, off } from "firebase/database";
import { Sidebar, Menu, Divider, Button, Modal, Icon, Label, Segment } from "semantic-ui-react";
import { SliderPicker } from "react-color";
import { useDispatch, useSelector } from "react-redux";
import { database } from "../../firebase";
import { motion } from "framer-motion";
import { setUserColors } from "../../actions";

const ColorPanel = () => {
  const [modal, setModal] = useState(false);
  const [primary, setPrimary] = useState("");
  const [secondary, setSecondary] = useState("");
  const [colors, setColors] = useState([]);
  const dispatch = useDispatch();
  
  const currentUser = useSelector((state) => state.user.currentUser);
  const userColorsRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      userColorsRef.current = ref(database, `users/${currentUser.uid}/colors`);
      addListener();
    }

    return () => {
      if (userColorsRef.current) off(userColorsRef.current);
    };
  }, [currentUser]);

  const addListener = () => {
    let userColors = [];
    onChildAdded(userColorsRef.current, (snap) => {
      setColors((prev) => [snap.val(), ...prev]);
    });
  };

  const handleChangePrimary = useCallback((color) => setPrimary(color.hex), []);
  const handleChangeSecondary = useCallback((color) => setSecondary(color.hex), []);

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
    if (!currentUser || !userColorsRef.current) return;

    const newColorRef = push(userColorsRef.current);
    await update(newColorRef, { primary, secondary });

    console.log("Colors added successfully");
  };

  const displayUserColors = (colors) =>
    colors.length > 0 &&
    colors.map((color, i) => (
      <React.Fragment key={i}>
        <Divider />
        <div
          className="color__container"
          onClick={() => dispatch(setUserColors(color.primary, color.secondary))}
        >
          <div className="color__square" style={{ background: color.primary }}>
            <div className="color__overlay" style={{ background: color.secondary }} />
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

      {/* Animated Modal */}
      <Modal basic open={modal} onClose={closeModal}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Modal.Header style={{ textAlign: "center", fontSize: "1.5rem", marginBottom: "2rem" }}>
            🎨 Choose App Colors
          </Modal.Header>
          <Modal.Content>
            <Segment inverted className="color-segment">
              <Label content="Primary Color" className="color-label" />
              <SliderPicker color={primary} onChange={handleChangePrimary} />
            </Segment>

            <Segment inverted className="color-segment">
              <Label content="Secondary Color" className="color-label" />
              <SliderPicker color={secondary} onChange={handleChangeSecondary} />
            </Segment>
          </Modal.Content>
          <Modal.Actions className="modal-actions">
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
