import React, { Component, Fragment } from "react";

import Button from "../../components/Button/Button";
import Input from "../../components/Form/Input/Input";
import ErrorHandler from "../../components/ErrorHandler/ErrorHandler";
import Post from "../../components/Feed/Post/Post";
import FeedEdit from "../../components/Feed/FeedEdit/FeedEdit";
import Paginator from "../../components/Paginator/Paginator";
import Loader from "../../components/Loader/Loader";
import Avatar from "../../components/Image/Avatar";
import "./Home.css";

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
  };

  componentDidMount() {
    const graphqlQuery = {
      query: `
            query{
              user{
                imageUrl
                name
                status
              }
            }
          `,
    };
    fetch("http://localhost:8080/graphql", {
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
          image: "http://localhost:8080/" + resData.data.user.imageUrl,
          name: resData.data.user.name,
          status: resData.data.user.status,
        });
      })
      .catch(this.catchError);

    this.loadUserPosts();
  }

  loadUserPosts = (direction) => {
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
              getUserPosts(page: $page){
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
    fetch("http://localhost:8080/graphql", {
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
          posts: resData.data.getUserPosts.posts.map((post) => {
            return {
              ...post,
              imagePath: post.imageUrl,
              userAvatar: "http://localhost:8080/" + post.creator.imageUrl,
              date: new Date(post.createdAt).toLocaleDateString("en-US"),
            };
          }),
          totalPosts: resData.data.getUserPosts.totalPosts,
          postsLoading: false,
        });
      })
      .catch(this.catchError);
  };

  newPostHandler = () => {
    this.setState({ isEditing: true });
  };

  startEditPostHandler = (postId) => {
    this.setState((prevState) => {
      const loadedPost = { ...prevState.posts.find((p) => p._id === postId) };

      return {
        isEditing: true,
        editPost: loadedPost,
      };
    });
  };

  cancelEditHandler = () => {
    this.setState({ isEditing: false, editPost: null });
  };

  finishEditHandler = (postData) => {
    this.setState({
      editLoading: true,
    });
    const formData = new FormData();
    formData.append("image", postData.image);
    if (this.state.editPath) {
      formData.append("oldPath", this.state.editPost.imagePath);
    }

    fetch("http://localhost:8080/post-image", {
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
        let graphqlQuery = {
          query: `
                mutation {
                  createPost(postInput: {title: "${postData.title}", content: "${postData.content}", imageUrl:"${imageUrl}"}) {
                    _id
                    title
                    content
                    imageUrl
                    creator {
                      name
                      imageUrl
                    }
                    createdAt
                  }
                }
              `,
        };

        if (this.state.editPost) {
          graphqlQuery = {
            query: `
                mutation {
                  updatePost(id: "${this.state.editPost._id}" ,postInput: {title: "${postData.title}", content: "${postData.content}", imageUrl: "${imageUrl}"}) {
                    _id
                    title
                    content
                    imageUrl
                    creator {
                      name
                      imageUrl
                    }
                    createdAt
                  }
                }
                `,
          };
        }

        return fetch("http://localhost:8080/graphql", {
          method: "POST",
          body: JSON.stringify(graphqlQuery),
          headers: {
            Authorization: "Bearer " + this.props.token,
            "Content-Type": "application/json",
          },
        });
      })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (resData.errors && resData.errors[0].status === 422) {
          throw new Error(
            "Validation failed. Make sure the email address isn't used yet!"
          );
        }
        if (resData.errors) {
          const errMessage = this.state.editPost
            ? "Editing post failed!"
            : "Creating post failed!";
          throw new Error(errMessage);
        }
        let resDataField = "createPost";
        if (this.state.editPost) {
          resDataField = "updatePost";
        }
        const post = {
          _id: resData.data[resDataField]._id,
          title: resData.data[resDataField].title,
          content: resData.data[resDataField].content,
          creator: resData.data[resDataField].creator,
          createdAt: resData.data[resDataField].createdAt,
          imagePath: resData.data[resDataField].imageUrl,
          userAvatar:
            "http://localhost:8080/" +
            resData.data[resDataField].creator.imageUrl,
        };
        this.setState((prevState) => {
          let updatedPosts = [...prevState.posts];
          let updatedTotalPosts = prevState.totalPosts;
          if (prevState.editPost) {
            const postIndex = prevState.posts.findIndex(
              (p) => p._id === prevState.editPost._id
            );
            updatedPosts[postIndex] = post;
          } else {
            updatedTotalPosts++;
            if (prevState.posts.length >= 2) {
              updatedPosts.pop();
            }
            updatedPosts.unshift(post);
          }
          return {
            posts: updatedPosts,
            isEditing: false,
            editPost: null,
            editLoading: false,
            totalPosts: updatedTotalPosts,
          };
        });
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          isEditing: false,
          editPost: null,
          editLoading: false,
          error: err,
        });
      });
  };
  deletePostHandler = (postId) => {
    const graphqlQuery = {
      query: `
            mutation{
              deletePost(id:"${postId}")
            }   
          `,
    };
    this.setState({ postsLoading: true });
    fetch("http://localhost:8080/graphql", {
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
          throw new Error("Deleting post failed!");
        }
        this.loadUserPosts();
        // this.setState(prevState => {
        //   const updatedPosts = prevState.posts.filter(p => p._id !== postId);
        //   return { posts: updatedPosts, postsLoading: false };
        // });
      })
      .catch((err) => {
        console.log(err);
        this.setState({ postsLoading: false });
      });
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
        <FeedEdit
          editing={this.state.isEditing}
          selectedPost={this.state.editPost}
          loading={this.state.editLoading}
          onCancelEdit={this.cancelEditHandler}
          onFinishEdit={this.finishEditHandler}
        />
        <section className="feed__user-data">
          <Avatar size="8" imageUrl={this.state.image}></Avatar>
          <div className="user-data-container">
            <h1>{this.state.name}</h1>
            <p>{this.state.status}</p>
          </div>
        </section>
        <section className="feed__control">
          <Button mode="raised" design="accent" onClick={this.newPostHandler}>
            New Post
          </Button>
        </section>
        <section className="feed">
          <h2 className="user-posts-header">Your Posts</h2>
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
              onPrevious={this.loadUserPosts.bind(this, "previous")}
              onNext={this.loadUserPosts.bind(this, "next")}
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
                  edit={true}
                  delete={true}
                  onStartEdit={this.startEditPostHandler.bind(this, post._id)}
                  onDelete={this.deletePostHandler.bind(this, post._id)}
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
