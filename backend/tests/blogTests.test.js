const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../index");


chai.use(chaiHttp);
const should = chai.should(); // Initialize should
describe("Blog", () => {
  let authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NWI2OGE1ODk2NGIxYzU2NDZmZjdlNDgiLCJ1c2VybmFtZSI6Imx1a2UiLCJlbWFpbCI6Imx1a2V0YW5rbEBnbWFpbC5jb20iLCJpYXQiOjE3MDY0NjI0NTEsImV4cCI6MTcwNjcyMTY1MX0.mjzTbjtX_VzRJnt7_sOenJSMlJRWCHFGooUhI7wjFFc" // Variable to store the authentication token
  let userId; // Variable to store the user ID
  let postId; // Variable to store the post ID

  before(async () => {
    // Inside the before hook
    try {
      // Perform user login and obtain the authentication token
      const loginCredentials = {
        email: "luketankl@gmail.com",
        password: "123456",
      };

      const loginResponse = await chai
        .request(app)
        .post("/api/auth/login")
        .send(loginCredentials);

      const setCookieHeader = loginResponse.headers["set-cookie"];

      if (
        !setCookieHeader ||
        !Array.isArray(setCookieHeader) ||
        setCookieHeader.length === 0
      ) {
        throw new Error("Cookie header is missing or invalid.");
      }

      authToken = setCookieHeader[0].split(";")[0]; // Extract the token from cookies

      // Check if the user ID is present in the response
      if (!loginResponse.body || !loginResponse.body._id) {
        throw new Error("User ID not found in the login response.");
      }

      userId = loginResponse.body._id; // Extract the user ID from the login response

      postId = null; // Initialize postId to null
    } catch (error) {
      console.error("Error during login:", error.message);
      throw error;
    }
  });

  it("should create a new post with authentication", async () => {
    try {
      // Create a post with the obtained authentication token
      const newPost = {
        title: "Test Post1",
        desc: "This is a test post with login.",
        photo:
          "https://images.pexels.com/photos/19168467/pexels-photo-19168467/free-photo-of-white-montain.jpeg?auto=compress&cs=tinysrgb&w=1600&lazy=load",
        username: "luke",
        userId: userId,
        categories: ["test"],
      };

      // Make a request to create a post with the logged-in user
      const res = await chai
        .request(app)
        .post("/api/posts/create")
        .set("Cookie", [authToken])
        .send(newPost);

      res.should.have.status(200);
      res.body.should.be.a("object");
      res.body.should.have.property("title").eql("Test Post1");
      res.body.should.have
        .property("desc")
        .eql("This is a test post with login.");
      res.body.should.have.property("username").eql("luke");
      res.body.should.have.property("userId").eql(userId);
      res.body.should.have.property("categories").eql(["test"]);

      postId = res.body._id; // Assign postId here
    } catch (error) {
      console.error(
        "Error during post creation with authentication:",
        error.message
      );
      throw error;
    }
  });

  it("delete post by ID", (done) => {
    if (!postId) {
      return done(new Error("postId is not defined"));
    }

    chai
      .request(app)
      .delete(`/api/posts/${postId}`)
      .set("Cookie", [authToken]) // Include the authentication token in the request cookies
      .end((err, res) => {
        res.should.have.status(200);
        res.text.should.eql('"Post has been deleted!"');
        done();
      });
  });
  it("delete post by ID should handle deleting a post with an invalid ID", (done) => {
    const invalidPostId = "invalid_post_id";

    chai
      .request(app)
      .delete(`/api/posts/${invalidPostId}`)
      .set("Cookie", [authToken]) // Include the authentication token in the request cookies
      .end((err, res) => {
        res.should.have.status(500);
        res.body.should.have.property("name").eql("CastError");
        res.body.should.have.property("kind").eql("ObjectId");
        res.body.should.have.property("path").eql("_id");
        res.body.should.have.property("value").eql(invalidPostId);

        done();
      });
  });

  it("create post with duplicate title should return an error", async () => {
    try {
      // Perform user login and obtain the authentication token
      const loginCredentials = {
        email: "luketankl@gmail.com",
        password: "123456",
      };

      const loginResponse = await chai
        .request(app)
        .post("/api/auth/login")
        .send(loginCredentials);

      const setCookieHeader = loginResponse.headers["set-cookie"];

      if (
        !setCookieHeader ||
        !Array.isArray(setCookieHeader) ||
        setCookieHeader.length === 0
      ) {
        throw new Error("Cookie header is missing or invalid.");
      }

      const authToken = setCookieHeader[0].split(";")[0]; // Extract the token from cookies

      const duplicatePost = {
        title: "test3",
        desc: "test3",
        photo:
          "https://images.pexels.com/photos/19168467/pexels-photo-19168467/free-photo-of-white-montain.jpeg?auto=compress&cs=tinysrgb&w=1600&lazy=load",
        username: "test1",
        userId: "65603b07d7debecc85789dfc",
        categories: ["demo"],
      };

      const res = await chai
        .request(app)
        .post("/api/posts/create")
        .set("Cookie", [authToken]) // Include the authentication token in the request cookies
        .send(duplicatePost);

      res.should.have.status(500);
      res.body.should.be.a("object");

      res.body.should.deep.equal({
        index: 0,
        code: 11000,
        keyPattern: {
          title: 1,
        },
        keyValue: {
          title: "test3",
        },
      });
    } catch (error) {
      console.error("Error during test:", error.message);
      throw error;
    }
  });
  // Assuming you have obtained the authentication token and stored it in a variable authToken

  it("should return a validation error", (done) => {
    const incompletePost = {
      title: "",
      desc: "",
      photo: "",
      username: "",
      userId: "",
      categories: [""],
    };

    chai
      .request(app)
      .post("/api/posts/create")
      .set("Authorization", `Bearer ${authToken}`)
      .send(incompletePost)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }

        if (res.status === 401) {
          // Handle authentication error
          res.text.should.include("You are not authenticated!");
        } else {
          // Handle validation error
          res.should.have.status(401);

          res.body.should.be.a("object");

          res.body.should.deep.equal({
            errors: {
              title: {
                name: "ValidatorError",
                message: "Path `title` is required.",
                properties: {
                  message: "Path `title` is required.",
                  type: "required",
                  path: "title",
                  value: "",
                },
                kind: "required",
                path: "title",
                value: "",
              },
              desc: {
                name: "ValidatorError",
                message: "Path `desc` is required.",
                properties: {
                  message: "Path `desc` is required.",
                  type: "required",
                  path: "desc",
                  value: "",
                },
                kind: "required",
                path: "desc",
                value: "",
              },
              username: {
                name: "ValidatorError",
                message: "Path `username` is required.",
                properties: {
                  message: "Path `username` is required.",
                  type: "required",
                  path: "username",
                  value: "",
                },
                kind: "required",
                path: "username",
                value: "",
              },
              userId: {
                name: "ValidatorError",
                message: "Path `userId` is required.",
                properties: {
                  message: "Path `userId` is required.",
                  type: "required",
                  path: "userId",
                  value: "",
                },
                kind: "required",
                path: "userId",
                value: "",
              },
            },
            _message: "Post validation failed",
            name: "ValidationError",
            message:
              "Post validation failed: title: Path `title` is required., desc: Path `desc` is required., username: Path `username` is required., userId: Path `userId` is required.",
          });
        }

        done();
      });
  });

  it("should update a post", (done) => {
    const postIdToUpdate = "6593f67d40adb7aae6afe8d9";
    const updatedPostData = {
      title: "test2",
      desc: "test22",
      photo:
        "https://images.pexels.com/photos/19168467/pexels-photo-19168467/free-photo-of-white-montain.jpeg?auto=compress&cs=tinysrgb&w=1600&lazy=load",
      username: "luke",
      userId: "6565a379dcd7d2b22d2e334f",
      categories: ["demo"],
    };

    chai
      .request(app)
      .put(`/api/posts/${postIdToUpdate}`)
      .set("Cookie", [authToken]) // Set authentication token in the cookies
      .send(updatedPostData)
      .end((err, res) => {
        // Add debugging statements

        res.should.have.status(200);
        res.body.should.have("object");
        res.body.should.have.property("title").eql("test2");
        res.body.should.have.property("desc").eql("test22");
        res.body.should.have.property("username").eql("luke");
        res.body.should.have.property("userId").eql("6565a379dcd7d2b22d2e334f");
        res.body.should.have.property("categories").eql(["demo"]);
        done();
      });
  });
  it("should update a post even with missing data", (done) => {
    const postIdToUpdate = "6593f67d40adb7aae6afe8d9";
    const updatedPostData = {
      title: "test2",
    };

    chai
      .request(app)
      .put(`/api/posts/${postIdToUpdate}`)
      .set("Cookie", [authToken]) // Include the authentication token in the request cookies
      .send(updatedPostData)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("title").eql("test2");

        done();
      });
  });
  it("should return an error for updating with an invalid post ID", (done) => {
    const invalidPostId = "invalidPostId";
    const updatedPostData = {
      title: "test2",
      desc: "test22",
      username: "test1",
      userId: "65603b07d7debecc85789dfc",
      categories: ["demo"],
    };

    chai
      .request(app)
      .put(`/api/posts/${invalidPostId}`)
      .set("Cookie", [authToken])
      .send(updatedPostData)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }

        res.should.have.status(500);
        res.body.should.deep.equal({
          stringValue: '"invalidPostId"',
          valueType: "string",
          kind: "ObjectId",
          value: "invalidPostId",
          path: "_id",
          reason: {},
          name: "CastError",
          message:
            'Cast to ObjectId failed for value "invalidPostId" (type string) at path "_id" for model "Post"',
        });

        done();
      });
  });
});

after((done) => {
  setTimeout(() => {
    console.log("Terminating the test suite.");
    process.exit();
  }, 1000);

  done();
});
