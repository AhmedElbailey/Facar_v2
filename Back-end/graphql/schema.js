const { buildSchema } = require("graphql");

module.exports = buildSchema(`
    schema{
        query: RootQuery
        mutation: RootMutation
    }


    type RootQuery{
        login(email:String!, password:String!): AuthData!
        getPosts(page:Int) : PostsData!
        getUserPosts(page:Int) : PostsData!
        post(id: ID!): Post!
        user: User!
        publisherData(publisherId: ID!): User!
        getPublisherPosts(publisherId: ID!, page:Int): PostsData!
    }

    type RootMutation {
        createUser(userInput: UserInputData) : User!
        createPost(postInput: PostInputData): Post!
        updatePost(id:ID!,postInput: PostInputData): Post!
        deletePost(id:ID!): Boolean
        updateAbout(data: aboutData!): User!
        updateContact(data: contactData!): User!
        sendGamil(data: gmailData!): Boolean!
    }
    
    input gmailData{
        subject:String!
        message:String!
        sentToEmail:String!
    }
    input aboutData{
        name: String!
        status: String! 
        introduction: String!
        purpose: String!
        interests: String!
    }

    input contactData{
        phone: String!
        gmail: String!
        linkedinLink: String!
        githubLink: String!
    }

    type AuthData{
        token: String!
        userId: String!
    }
    type PostsData{
        posts: [Post!]!
        totalPosts: Int!
    }

    input UserInputData{
        name: String!
        email: String!
        password: String!
    }

    input PostInputData{
        title: String!
        content: String!
        imageUrl: String!
    }

    type User{
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String!
        introduction: String!
        purpose: String!
        interests: String!
        posts: [Post!]!
        imageUrl: String!
        phone: String!
        gmail: String!
        linkedinLink: String!
        githubLink: String!
    }

    type Post{
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

`);
