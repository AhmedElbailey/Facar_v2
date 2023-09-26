import React, { Component, Fragment } from "react";
import Button from "../../components/Button/Button";
import Input from "../../components/Form/Input/Input";
import Textarea from "../../components/Form/Input/Textarea";
import ErrorHandler from "../../components/ErrorHandler/ErrorHandler";
import { generateBase64FromImage } from "../../util/image";
import "./About.css";

class About extends Component {
  state = {
    name: "",
    status: "",
    introduction: "",
    purpose: "",
    interests: "",
    introductionMod: "",
    purposeMod: "",
    interestsMod: "",
  };

  componentDidMount() {
    const graphqlQuery = {
      query: `
            query{
              user{
                name
                status
                introduction
                purpose
                interests
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
          throw new Error("Fetching status failed!");
        }
        this.setState({
          name: resData.data.user.name,
          status: resData.data.user.status,
          introduction: resData.data.user.introduction.replaceAll("[n]", "\n"),
          purpose: resData.data.user.purpose.replaceAll("[n]", "\n"),
          interests: resData.data.user.interests.replaceAll("[n]", "\n"),
        });
      })
      .catch(this.catchError);
  }

  imageUpdateHandler = (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("image", this.state.image);

    fetch("https://facar-v2-api.onrender.com/user-avatar", {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + this.props.token,
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((fileResData) => {
        let imageUrl;
        if (this.state.editPost && !fileResData.filePath) {
          imageUrl = "undefined";
        } else {
          if (!fileResData.filePath) {
            throw new Error(
              "Only images with png, jpg and jpeg extentions are allowed"
            );
          }
          imageUrl = fileResData.filePath.replace("\\", "/");
        }
      })
      .catch((err) => {
        this.setState({ error: err });
      });
  };

  aboutUpdateHandler = (event) => {
    event.preventDefault();
    const graphqlQuery = {
      query: `
        mutation{
          updateAbout(data:{
            name:"${this.state.name}",
            status:"${this.state.status}",
            introduction:"${this.state.introductionMod}",
            purpose:"${this.state.purposeMod}",
            interests:"${this.state.interestsMod}",
          }){
            name
            status
            introduction
            purpose
            interests
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
          throw new Error("Can't update About!");
        }
      })
      .catch(this.catchError);
  };

  nameInputChangeHandler = (input, value) => {
    this.setState({ name: value });
  };
  statusInputChangeHandler = (input, value) => {
    this.setState({ status: value });
  };
  introInputChangeHandler = (input, value) => {
    this.setState({
      introduction: value,
      introductionMod: value.replace(/\n/g, "[n]"),
    });
  };
  purposeInputChangeHandler = (input, value) => {
    this.setState({
      purpose: value,
      purposeMod: value.replace(/\n/g, "[n]"),
    });
  };
  interestsInputChangeHandler = (input, value) => {
    this.setState({
      interests: value,
      interestsMod: value.replace(/\n/g, "[n]"),
    });
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  catchError = (error) => {
    this.setState({ error: error });
  };

  imageChangeHandler = (input, value, files) => {
    if (files) {
      generateBase64FromImage(files[0])
        .then((b64) => {
          this.setState({ imagePreview: b64 });
        })
        .then(() => {
          this.state.image = files[0];
          return {
            value: files ? files[0] : value,
          };
        })
        .catch((e) => {
          this.setState({ imagePreview: null });
        });
    }
  };

  render() {
    return (
      <Fragment>
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
        <form className="about-form" onSubmit={this.imageUpdateHandler}>
          <section className="about__section">
            <h2>Avatar Image</h2>
            <Input
              type="file"
              control="input"
              onChange={this.imageChangeHandler}
            />
          </section>
          <Button mode="flat" type="submit">
            Update
          </Button>
        </form>
        <form className="about-form" onSubmit={this.aboutUpdateHandler}>
          <section className="about__section">
            <h2>Full Name</h2>
            <Input
              type="text"
              placeholder="Full Name"
              control="input"
              onChange={this.nameInputChangeHandler}
              value={this.state.name}
            />
          </section>
          <section className="about__section">
            <h2>Status</h2>
            <Input
              type="text"
              placeholder="Your status"
              control="input"
              onChange={this.statusInputChangeHandler}
              value={this.state.status}
            />
          </section>
          <section className="about__section">
            <h2>Introduce Yourself</h2>
            <Textarea
              type="text"
              placeholder="Your introduction"
              control="input"
              onChange={this.introInputChangeHandler}
              value={this.state.introduction}
            />
          </section>
          <section className="about__section">
            <h2>Purpose of The Plog</h2>
            <Textarea
              type="text"
              placeholder="Your Purpose"
              control="input"
              onChange={this.purposeInputChangeHandler}
              value={this.state.purpose}
            />
          </section>
          <section className="about__section">
            <h2>Interests</h2>
            <Textarea
              type="text"
              placeholder="Your Interests"
              control="input"
              onChange={this.interestsInputChangeHandler}
              value={this.state.interests}
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

export default About;
