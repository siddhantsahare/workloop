import { useState } from "react";
import { Modal, Button, Icon, Input } from "semantic-ui-react";

const FileUploadModal = ({ open, closeModal, uploadFile }) => {
  const authorizedTypes = ["image/jpeg", "image/png"];
  const [file, setFile] = useState(null);

  const addFile = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const isAuthorized = (file) => {
    return file && authorizedTypes.includes(file.type);
  };

  const sendFile = () => {
    if (file && isAuthorized(file)) {
      const metaData = { contentType: file.type };
      uploadFile(file, metaData);
      setFile(null);
      closeModal();
    } else {
      console.error("Unauthorized file type");
    }
  };

  return (
    <Modal
      basic
      open={open}
      onClose={closeModal}
      size="small"
      style={{
        background: "#4c3c4c", // Semi-transparent background
        backdropFilter: "blur(10px)", // Glassmorphism effect
        borderRadius: "15px",
        padding: "20px",
      }}
    >
      <Modal.Header
        style={{
          textAlign: "center",
          fontSize: "1.5rem",
          fontWeight: "bold",
          color: "#fff",
        }}
      >
        Select an Image File
      </Modal.Header>

      <Modal.Content>
        <Input
          fluid
          label={{
            content: "JPG, PNG",
            color: "blue",
            style: { borderRadius: "5px" },
          }}
          labelPosition="right"
          name="file"
          type="file"
          onChange={addFile}
          style={{
            padding: "10px",
            borderRadius: "10px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            background: "rgba(255, 255, 255, 0.1)",
            color: "#fff",
          }}
        />
      </Modal.Content>

      <Modal.Actions style={{ textAlign: "center" }}>
        <Button
          color="green"
          inverted
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            fontSize: "1rem",
            transition: "0.3s",
          }}
          onClick={sendFile}
        >
          <Icon name="checkmark" /> Send
        </Button>

        <Button
          color="red"
          inverted
          onClick={closeModal}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            fontSize: "1rem",
            transition: "0.3s",
          }}
        >
          <Icon name="remove" /> Cancel
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default FileUploadModal;
