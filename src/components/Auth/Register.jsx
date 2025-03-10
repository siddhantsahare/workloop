import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import md5 from "md5";
import { Grid, Form, Segment, Button, Header, Message, Icon } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { auth, database } from "../../firebase";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const isFormValid = () => {
    const { username, email, password, passwordConfirmation } = formData;
    if (!username || !email || !password || !passwordConfirmation) {
      setErrors([{ message: "Fill in all fields" }]);
      return false;
    } else if (password.length < 6 || password !== passwordConfirmation) {
      setErrors([{ message: "Password is invalid" }]);
      return false;
    }
    return true;
  };

  const displayErrors = (errors) => errors.map((error, i) => <p key={i}>{error.message}</p>);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isFormValid()) {
      setErrors([]);
      setLoading(true);
      try {
        const { email, password, username } = formData;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, {
          displayName: username,
          photoURL: `http://gravatar.com/avatar/${md5(email)}?d=identicon`,
        });
        await set(ref(database, `users/${user.uid}`), {
          name: user.displayName,
          avatar: user.photoURL,
        });
        setLoading(false);
      } catch (err) {
        setErrors([err]);
        setLoading(false);
      }
    }
  };

  const handleInputError = (inputName) => {
    return errors.some((error) => error.message.toLowerCase().includes(inputName)) ? "error" : "";
  };

  return (
    <Grid textAlign="center" verticalAlign="middle" className="app">
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header as="h1" icon color="orange" textAlign="center">
          <Icon name="puzzle piece" color="orange" />
          Register for WorkLoop
          <Header.Subheader>Keeping teams in the loop.</Header.Subheader>
        </Header>
        <Form onSubmit={handleSubmit} size="large">
          <Segment stacked>
            <Form.Input
              fluid
              name="username"
              icon="user"
              iconPosition="left"
              placeholder="Username"
              onChange={handleChange}
              value={formData.username}
              type="text"
            />
            <Form.Input
              fluid
              name="email"
              icon="mail"
              iconPosition="left"
              placeholder="Email Address"
              onChange={handleChange}
              value={formData.email}
              className={handleInputError("email")}
              type="email"
            />
            <Form.Input
              fluid
              name="password"
              icon="lock"
              iconPosition="left"
              placeholder="Password"
              onChange={handleChange}
              value={formData.password}
              className={handleInputError("password")}
              type="password"
            />
            <Form.Input
              fluid
              name="passwordConfirmation"
              icon="repeat"
              iconPosition="left"
              placeholder="Password Confirmation"
              onChange={handleChange}
              value={formData.passwordConfirmation}
              className={handleInputError("password")}
              type="password"
            />
            <Button disabled={loading} className={loading ? "loading" : ""} color="orange" fluid size="large">
              Submit
            </Button>
          </Segment>
        </Form>
        {errors.length > 0 && (
          <Message error>
            <h3>Error</h3>
            {displayErrors(errors)}
          </Message>
        )}
        <Message>
          Already a user? <Link to="/login">Login</Link>
        </Message>
      </Grid.Column>
    </Grid>
  );
};

export default Register;