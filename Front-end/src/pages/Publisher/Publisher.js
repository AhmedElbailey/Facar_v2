import React, { Component, Fragment } from "react";

import Button from "../../components/Button/Button";
import Input from "../../components/Form/Input/Input";
import ErrorHandler from "../../components/ErrorHandler/ErrorHandler";
import Post from "../../components/Feed/Post/Post";
import FeedEdit from "../../components/Feed/FeedEdit/FeedEdit";
import Paginator from "../../components/Paginator/Paginator";
import Loader from "../../components/Loader/Loader";
import Avatar from "../../components/Image/Avatar";
import Textarea from "../../components/Form/Input/Textarea";
import "./Publisher.css";

class Home extends Component {
  state = {
    isEditing: false,
    posts: [],
    image: "",
    status: "",
    name: "",
    totalPosts: 0,
    editPost: null,
    postPage: 1,
    postsLoading: true,
    editLoading: false,

    subject: "",
    message: "",
  };

  componentDidMount() {
    const publisherId = this.props.match.params.publisherId;
    const graphqlQuery = {
      query: `
            query{
              publisherData(publisherId:"${publisherId}"){
                imageUrl
                name
                status
                phone
                gmail
                githubLink
                linkedinLink
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
          image:
            "https://facar-v2-api.onrender.com/" +
            resData.data.publisherData.imageUrl,
          name: resData.data.publisherData.name,
          status: resData.data.publisherData.status,
          phone: resData.data.publisherData.phone,
          gmail: resData.data.publisherData.gmail,
          githubLink: resData.data.publisherData.githubLink,
          linkedinLink: resData.data.publisherData.linkedinLink,
          introduction: resData.data.publisherData.introduction.replaceAll(
            "[n]",
            "\n"
          ),
          purpose: resData.data.publisherData.purpose.replaceAll("[n]", "\n"),
          interests: resData.data.publisherData.interests.replaceAll(
            "[n]",
            "\n"
          ),
        });
      })
      .catch(this.catchError);

    this.loadPublisherPosts();
  }

  loadPublisherPosts = (direction) => {
    const publisherId = this.props.match.params.publisherId;
    if (direction) {
      this.setState({ postsLoading: true, posts: [] });
    }
    let page = this.state.postPage;
    if (direction === "next") {
      page++;
      this.setState({ postPage: page });
    }
    if (direction === "previous") {
      page--;
      this.setState({ postPage: page });
    }

    const graphqlQuery = {
      query: `
            query fetchPosts($page: Int){
                getPublisherPosts(publisherId: "${publisherId}", page: $page){
                    posts{
                        _id
                        title
                        content
                        imageUrl
                        creator{
                            _id
                            name
                            imageUrl
                        }
                        createdAt
                    }
                    totalPosts
            
                }
            }
          
          `,
      variables: {
        page: page,
      },
    };
    fetch("https://facar-v2-api.onrender.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.props.token,
      },
      body: JSON.stringify(graphqlQuery),
    })
      .then((res) => {
        if (res.status !== 200) {
          throw new Error("Failed to fetch posts.");
        }
        return res.json();
      })
      .then((resData) => {
        if (resData.errors) {
          throw new Error("Fetching posts failed!");
        }
        this.setState({
          posts: resData.data.getPublisherPosts.posts.map((post) => {
            return {
              ...post,
              imagePath: post.imageUrl,
              userAvatar:
                "https://facar-v2-api.onrender.com/" + post.creator.imageUrl,
              date: new Date(post.createdAt).toLocaleDateString("en-US"),
            };
          }),
          totalPosts: resData.data.getPublisherPosts.totalPosts,
          postsLoading: false,
        });
      })
      .catch(this.catchError);
  };

  sendGmailHandler = (event) => {
    event.preventDefault();
    // Check if publisher has an gmail
    if (!this.state.gmail) {
      const error = new Error("Publisher doesn't have a gmail address");
      return this.catchError(error);
    }
    fetch("https://facar-v2-api.onrender.com/sendGmail", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.props.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: this.state.subject,
        message: this.state.message,
        sentToEmail: this.state.gmail,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        console.log("response: ", resData);
        if (resData.errors) {
          throw new Error("Couldn't Send the Email!");
        }
      })
      .catch(this.catchError);
  };

  msgChangeHandler = (input, value) => {
    this.setState({
      message: value,
    });
  };
  subjectChangeHandler = (input, value) => {
    this.setState({ subject: value });
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
        <section className="feed__user-data">
          <Avatar size="8" imageUrl={this.state.image}></Avatar>
          <div className="user-data-container">
            <h1>{this.state.name}</h1>
            <p>{this.state.status}</p>
          </div>
        </section>
        <h2 className="user-posts-header">About</h2>
        <section className="feed__about-section">
          <section className="about__section">
            <h2>Full Name</h2>
            <Input
              type="text"
              placeholder="Full Name"
              control="input"
              value={this.state.name}
              disabled={true}
            />
          </section>
          <section className="about__section">
            <h2>Status</h2>
            <Input
              type="text"
              placeholder="Your status"
              control="input"
              value={this.state.status}
              disabled={true}
            />
          </section>
          <section className="about__section">
            <h2>Introduction</h2>
            <Textarea
              type="text"
              placeholder="Your introduction"
              control="input"
              value={this.state.introduction}
              disabled={true}
            />
          </section>
          <section className="about__section">
            <h2>Purpose of The Plog</h2>
            <Textarea
              type="text"
              placeholder="Your Purpose"
              control="input"
              value={this.state.purpose}
              disabled={true}
            />
          </section>
          <section className="about__section">
            <h2>Interests</h2>
            <Textarea
              type="text"
              placeholder="Your Interests"
              control="input"
              value={this.state.interests}
              disabled={true}
            />
          </section>
        </section>
        <h2 className="user-posts-header">Contacts</h2>
        <section className="feed__about-section">
          <section className="about__section">
            <h2>Phone Number</h2>
            <Input
              type="text"
              placeholder="Phone Number"
              control="input"
              value={this.state.phone}
              disabled={true}
            />
          </section>
          <section className="about__section">
            <h2>Gmail Address</h2>
            <Input
              type="text"
              placeholder="Gmail"
              control="input"
              value={this.state.gmail}
              disabled={true}
            />
          </section>
          <section className="about__section">
            <h2>Linkedin Link</h2>
            <Input
              type="text"
              placeholder="Linkedin URL"
              control="input"
              value={this.state.linkedinLink}
              disabled={true}
            />
          </section>
          <section className="about__section">
            <h2>Github Link</h2>
            <Input
              type="text"
              placeholder="Github URL"
              control="input"
              value={this.state.githubLink}
              disabled={true}
            />
          </section>
          <form
            className="publisher__gmail-form"
            onSubmit={this.sendGmailHandler}
            netlify
          >
            <section className="about__section">
              <h2>Send Email</h2>
              <Input
                type="text"
                placeholder="Subject"
                control="input"
                onChange={this.subjectChangeHandler}
              />
              <Textarea
                type="text"
                placeholder="Message"
                control="input"
                onChange={this.msgChangeHandler}
              />
            </section>
            <Button mode="flat" type="submit">
              Send
            </Button>
          </form>
        </section>
        <section className="feed">
          <h2 className="user-posts-header">Posts</h2>
          {this.state.postsLoading && (
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <Loader />
            </div>
          )}
          {this.state.posts.length <= 0 && !this.state.postsLoading ? (
            <p style={{ textAlign: "center" }}>No posts found.</p>
          ) : null}
          {!this.state.postsLoading && (
            <Paginator
              onPrevious={this.loadPublisherPosts.bind(this, "previous")}
              onNext={this.loadPublisherPosts.bind(this, "next")}
              lastPage={Math.ceil(this.state.totalPosts / 2)}
              currentPage={this.state.postPage}
            >
              {this.state.posts.map((post) => (
                <Post
                  key={post._id}
                  id={post._id}
                  author={post.creator.name}
                  publisherId={post.creator._id}
                  date={new Date(post.createdAt).toLocaleDateString("en-US")}
                  title={post.title}
                  image={post.imageUrl}
                  userAvatar={post.userAvatar}
                  content={post.content}
                  edit={false}
                  delete={false}
                />
              ))}
            </Paginator>
          )}
        </section>
      </Fragment>
    );
  }
}
export default Home;
