import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Grid, Form, Segment, Button, Header, Message, Icon } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { auth } from "../../firebase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const isFormValid = () => email && password;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isFormValid()) return;

    setErrors([]);
    setLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log(userCredential);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setErrors([err]);
      setLoading(false);
    }
  };

  const handleInputError = (inputName) => {
    return errors.some((error) => error.message.toLowerCase().includes(inputName)) ? "error" : "";
  };

  return (
    <Grid textAlign="center" verticalAlign="middle" className="app">
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header as="h1" icon color="violet" textAlign="center">
          <Icon name="code branch" color="violet" />
          Login to WorkLoop
          <Header.Subheader>Keeping teams in the loop.</Header.Subheader>
        </Header>
        <Form onSubmit={handleSubmit} size="large">
          <Segment stacked>
            <Form.Input
              fluid
              name="email"
              icon="mail"
              iconPosition="left"
              placeholder="Email Address"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className={handleInputError("email")}
              type="email"
            />
            <Form.Input
              fluid
              name="password"
              icon="lock"
              iconPosition="left"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className={handleInputError("password")}
              type="password"
            />
            <Button disabled={loading} className={loading ? "loading" : ""} color="violet" fluid size="large">
              Submit
            </Button>
          </Segment>
        </Form>
        {errors.length > 0 && (
          <Message error>
            <h3>Error</h3>
            {errors.map((error, i) => (
              <p key={i}>{error.message}</p>
            ))}
          </Message>
        )}
        <Message>
          Don't have an account? <Link to="/register">Register</Link>
        </Message>
      </Grid.Column>
    </Grid>
  );
};

export default Login;
