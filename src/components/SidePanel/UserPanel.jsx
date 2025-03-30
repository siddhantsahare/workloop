import { useState, useRef, useEffect } from "react";
import {
  Grid,
  Header,
  Icon,
  Dropdown,
  Image,
  Modal,
  Input,
  Button,
} from "semantic-ui-react";
import AvatarEditor from "react-avatar-editor";
import { auth, database } from "../../firebase";
import { useSelector } from "react-redux";
import { onValue, ref, remove, update } from "firebase/database";

const UserPanel = () => {
  const user = useSelector((state) => state.user.currentUser);
  const primaryColor = useSelector((state) => state.colors.primaryColor);

  const [modal, setModal] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [croppedImage, setCroppedImage] = useState("");
  const [blob, setBlob] = useState(null);
  const [avatar, setAvatar] = useState(null);

  const avatarEditorRef = useRef(null);
  useEffect(() => {
    if (auth.currentUser) {
      const userRef = ref(database, `users/${auth.currentUser.uid}`);
      onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        if (userData?.avatar) {
          setAvatar(userData.avatar);
        }
      });
    }
  }, []);
  const handleSignout = async () => {
    if (user) {
      const presenceRef = ref(database, `presence/${user.uid}`);
      await remove(presenceRef);
    }
    await auth.signOut();
  };

  const handleChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => setPreviewImage(reader.result);
    }
  };

  const handleCropImage = () => {
    if (avatarEditorRef.current) {
      const canvas = avatarEditorRef.current.getImageScaledToCanvas();
      canvas.toBlob((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        setCroppedImage(imageUrl);
        setBlob(blob);
      });
    }
  };

  const uploadCroppedImage = async () => {
    if (blob && user) {
      const reader = new FileReader();

      reader.readAsDataURL(blob); // Convert to Base64
      reader.onloadend = async () => {
        const base64Data = reader.result; // Get Base64 string

        try {
          // Store Base64 image in Firebase realtime Database instead of Authentication
          await update(ref(database, `users/${user.uid}`), {
            avatar: base64Data,
          });

          setModal(false);
          // dispatch(setUser({
          //   ...user,  // Keep existing user data
          //   photoURL: base64Data
          // }));
        } catch (error) {
          console.error("Error updating user profile:", error);
        }
      };

      reader.onerror = (error) => {
        console.error("File reading error:", error);
      };
    }
  };

  const dropdownOptions = [
    {
      key: "user",
      text: (
        <span>
          Signed in as <strong>{user?.displayName || "User"}</strong>
        </span>
      ),
      disabled: true,
    },
    {
      key: "avatar",
      text: <span onClick={() => setModal(true)}>Change Avatar</span>,
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
          <Header inverted floated="left" as="h2">
            <Icon name="users" />
            <Header.Content>WorkLoop</Header.Content>
          </Header>
          <Header style={{ padding: "0.25em" }} as="h4" inverted>
            <Dropdown
              trigger={
                <span>
                  <Image src={avatar || user?.photoURL} spaced="right" avatar />
                  {user ? user.displayName : "User"}
                </span>
              }
              options={dropdownOptions}
            />
          </Header>
        </Grid.Row>

        {/* Change Avatar Modal */}
        <Modal
          open={modal}
          onClose={() => setModal(false)}
          dimmer="blurring"
          size="small"
          className="styled-modal"
        >
          <Modal.Header className="text-center font-bold text-lg">
            Change Avatar
          </Modal.Header>

          <Modal.Content className="p-6">
            <Input
              onChange={handleChange}
              fluid
              type="file"
              label="New Avatar"
              className="mb-4"
            />

            {/* Added Padding & Centering */}
            <div className="avatar-modal">
              <Grid centered stackable columns={2} className="w-full">
                <Grid.Row centered>
                  {/* Avatar Editor */}
                  <Grid.Column className="flex justify-center items-center p-4">
                    {previewImage && (
                      <div className="border-4 border-gray-300 p-3 rounded-lg shadow-md">
                        <AvatarEditor
                          ref={avatarEditorRef}
                          image={previewImage}
                          width={120}
                          height={120}
                          border={30}
                          scale={1.2}
                        />
                      </div>
                    )}
                  </Grid.Column>

                  {/* Cropped Image - Now Centered */}
                  <Grid.Column className="flex justify-center items-center p-4">
                    {croppedImage && (
                      <div className="flex justify-center items-center h-full">
                        <Image
                          className="rounded-full border-4 border-green-500 p-2 shadow-md"
                          width={100}
                          height={100}
                          src={croppedImage}
                        />
                      </div>
                    )}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </div>
          </Modal.Content>

          <Modal.Actions className="flex justify-center gap-4 p-4">
            {croppedImage && (
              <Button
                color="green"
                className="rounded-lg px-4 py-2 shadow-md"
                onClick={uploadCroppedImage}
              >
                <Icon name="save" /> Change Avatar
              </Button>
            )}
            <Button
              color="blue"
              className="rounded-lg px-4 py-2 shadow-md"
              onClick={handleCropImage}
            >
              <Icon name="image" /> Preview
            </Button>
            <Button
              color="red"
              className="rounded-lg px-4 py-2 shadow-md"
              onClick={() => setModal(false)}
            >
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </Grid.Column>
    </Grid>
  );
};

export default UserPanel;
