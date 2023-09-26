import React, { Component, Fragment } from "react";
import Button from "../../components/Button/Button";
import Input from "../../components/Form/Input/Input";
import ErrorHandler from "../../components/ErrorHandler/ErrorHandler";
import "./Contact.css";

class Contact extends Component {
  state = {
    phone: "",
    gmail: "",
    githubLink: "",
    linkedinLink: "",
    error: "",
  };

  componentDidMount() {
    const graphqlQuery = {
      query: `
            query{
              user{
                phone
                gmail
                githubLink
                linkedinLink
              }
            }
          `,
    };
    fetch("https://facar-v2-api.onrender.com/graphql", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.props.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (resData.errors) {
          throw new Error("Fetching Contacts failed!");
        }
        this.setState({
          phone: resData.data.user.phone,
          gmail: resData.data.user.gmail,
          githubLink: resData.data.user.githubLink,
          linkedinLink: resData.data.user.linkedinLink,
        });
      })
      .catch(this.catchError);
  }

  contactUpdateHandler = (event) => {
    event.preventDefault();
    //   Gmail validation
    if (
      !this.state.gmail.match(/^[A-Za-z\._\-0-9]*[@][A-Za-z]*[\.][a-z]{2,4}$/)
    ) {
      const error = new Error("Please enter a valid gmail");
      return this.setState({ error: error });
    }
    const graphqlQuery = {
      query: `
        mutation{
          updateContact(data:{
            phone:"${this.state.phone}",
            gmail:"${this.state.gmail}",
            linkedinLink:"${this.state.linkedinLink}",
            githubLink:"${this.state.githubLink}",
          }){
            phone
            gmail
            linkedinLink
            githubLink
          }
        }
      `,
    };
    fetch("https://facar-v2-api.onrender.com/graphql", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.props.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (resData.errors) {
          throw new Error("Can't update Contacts!");
        }
      })
      .catch(this.catchError);
  };

  phoneInputChangeHandler = (input, value) => {
    this.setState({ phone: value });
  };
  gmailInputChangeHandler = (input, value) => {
    this.setState({ gmail: value });
  };
  linkedinInputChangeHandler = (input, value) => {
    this.setState({ linkedinLink: value });
  };
  githubInputChangeHandler = (input, value) => {
    this.setState({ githubLink: value });
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  catchError = (error) => {
    this.setState({ error: error });
  };

  render() {
    return (
      <Fragment>
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
        <form
          netlify
          className="about-form"
          onSubmit={this.contactUpdateHandler}
        >
          <section className="about__section">
            <h2>Phone Number</h2>
            <Input
              type="text"
              placeholder="Your Phone Number"
              control="input"
              onChange={this.phoneInputChangeHandler}
              value={this.state.phone}
            />
          </section>
          <section className="about__section">
            <h2>Gmail Address</h2>
            <Input
              type="text"
              placeholder="Your Gmail Address"
              control="input"
              onChange={this.gmailInputChangeHandler}
              value={this.state.gmail}
            />
          </section>
          <section className="about__section">
            <h2>Linkedin Link</h2>
            <Input
              type="text"
              placeholder="Linkedin URL"
              control="input"
              onChange={this.linkedinInputChangeHandler}
              value={this.state.linkedinLink}
            />
          </section>
          <section className="about__section">
            <h2>Github Link</h2>
            <Input
              type="text"
              placeholder="Github URL"
              control="input"
              onChange={this.githubInputChangeHandler}
              value={this.state.githubLink}
            />
          </section>
          <Button mode="flat" type="submit">
            Update
          </Button>
        </form>
      </Fragment>
    );
  }
}

export default Contact;
