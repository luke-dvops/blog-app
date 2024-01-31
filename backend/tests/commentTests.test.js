const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../index");
const should = chai.should();
const sinon = require("sinon");
const Comment = require("../models/Comment");

chai.use(chaiHttp);

describe("Create comments", () => {
  let authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NWI5MDk5MDA3OTEyNmI2ZjZmYzJlMjEiLCJ1c2VybmFtZSI6Imx1a2UiLCJlbWFpbCI6Imx1a2V0YW5rbEBnbWFpbC5jb20iLCJpYXQiOjE3MDY2MjU0MjQsImV4cCI6MTcwNjg4NDYyNH0.Vq0HK6z7YvINgnOP11VjbPpDPZQ4U4YnfBJEQb2DHHM"; // Variable to store the authentication token

  before(async () => {
    try {
      // Perform user login and obtain the authentication token
      const loginCredentials = {
        email: "qj1@gmail.com",
        password: "qj1",
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
    } catch (error) {
      console.error("Error during login:", error);
      throw error; // Fail the test if there's an error during login
    }
  });

  it("should create a new comment with authentication", async () => {
    try {
      // Create a comment with the obtained authentication token
      const newComment = {
        comment: "This is a test comment with login.",
        author: "testUser",
        postId: "6562dcb608a806628f5f29b5", // Use the postId obtained from the previous test
        userId: "65603b07d7debecc85789dfc",
      };

      // Make a request to create a comment with the logged-in user
      const res = await chai
        .request(app)
        .post("/api/comments/create")
        .set("Cookie", [authToken]) // Include the authentication token in the request cookies
        .send(newComment);

      // Validate the response status or other criteria if needed
      res.should.have.status(200);
      res.body.should.be.a("object");
      res.body.should.have.property("comment");
      res.body.should.have.property("author");
      res.body.should.have.property("postId");
      res.body.should.have.property("userId");
    } catch (error) {
      console.error(
        "Error during comment creation with authentication:",
        error
      );
      throw error; // Fail the test if there's an error during comment creation
    }
  });

  it("should not create a new comment without authentication", async () => {
    try {
      // Attempt to create a comment without authentication
      const newComment = {
        comment: "This is a test comment without login.",
        author: "testUser",
        postId: "6562dcb608a806628f5f29b5",
        userId: "65603b07d7debecc85789dfc",
      };

      // Make a request to create a comment without authentication
      const res = await chai
        .request(app)
        .post("/api/comments/create")
        .send(newComment);

      // Validate that the response indicates a lack of authentication
      res.should.have.status(401);
      res.body.should.be.a("string"); // Update the expectation to a string
      res.body.should.equal("You are not authenticated!");
    } catch (error) {
      console.error(
        "Error during comment creation without authentication:",
        error
      );
      throw error; // Fail the test if there's an error during comment creation without authentication
    }
  });

  it("should not create a new comment with missing fields", async () => {
    // Attempt to create a comment with invalid data
    const invalidComment = {
      comment: "This is a test comment with invalid data",
      author: "",
      postId: "6562dcb608a806628f5f29b5",
      userId: "65603b07d7debecc85789dfc",
      // Include invalid or missing fields here
    };

    // Make a request to create a comment with invalid data
    const res = await chai
      .request(app)
      .post("/api/comments/create")
      .set("Cookie", [authToken])
      .send(invalidComment);

    // Validate that the response indicates a validation error
    res.should.have.status(500);

    res.body.should.be.a("object");
    res.body.should.have.property("errors");

    // Check for errors on the author field
    res.body.errors.should.have.property("author");
    res.body.errors.author.should.have
      .property("message")
      .eql("Path `author` is required.");

    // Check for errors on the comment field (if applicable)
    if ("comment" in res.body.errors) {
      res.body.errors.comment.should.have
        .property("message")
        .eql("Path `comment` is required.");
    }
  });

  it("should create a new comment with valid data and ignore additional fields", async () => {
    // Provide valid comment data with additional fields
    const validCommentWithAdditionalFields = {
      comment: "This comment has additional fields.",
      author: "testUser",
      postId: "6562dcb608a806628f5f29b5",
      userId: "65603b07d7debecc85789dfc",
      additionalField: "additionalValue", // Additional field not expected by the server
    };

    // Make a request to create a comment with additional fields
    const res = await chai
      .request(app)
      .post("/api/comments/create")
      .set("Cookie", [authToken])
      .send(validCommentWithAdditionalFields);

    // Validate that the response indicates a successful comment creation
    res.should.have.status(200); // Adjust based on your server's behavior
    res.body.should.be.a("object");
  });
});

describe("Update comments", () => {
  let authToken; // Variable to store the authentication token

  before(async () => {
    try {
      // Perform user login and obtain the authentication token
      const loginCredentials = {
        email: "qj1@gmail.com",
        password: "qj1",
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
    } catch (error) {
      console.error("Error during login:", error);
      throw error; // Fail the test if there's an error during login
    }
  });

  it("should update an existing comment with valid data", async () => {
    // Provide valid data for the update
    const validUpdateData = {
      comment: "This comment has been updated.",
      author: "testtest",
      postId: "65b2a1f6ccf2d0a949d2a92",
      userId: "655f2854842eab48af35e7c5"
    };

    // Make a request to update the comment with valid data
    const res = await chai
      .request(app)
      .put("/api/comments/65603b07d7debecc85789dfb")
      .set("Cookie", [authToken])
      .send(validUpdateData);

    res.should.have.status(200);
    res.body.should.be.a("object");
  });

  it("should not update an existing comment without proper authorization", async () => {
    const invalidAuthToken = "0";

    // Provide valid data for the update
    const validUpdateData = {
      comment: "Updated comment content.",
      author: "updatedAuthor",
    };

    // Make a request to update the comment without proper authorization
    const res = await chai
      .request(app)
      .put(`/api/comments/656353ebb5c7b318613b3056`)
      .set("Cookie", [invalidAuthToken])
      .send(validUpdateData);

    res.should.have.status(401); // Assuming 401 is the status for authentication failure
    res.body.should.be.a("string"); // Update the expectation to a string
    res.body.should.equal("You are not authenticated!"); // Adjust based on the actual error message
  });

  it("should not update a comment with empty update data (empty array)", async () => {
    const commentIdToUpdate = "656353ebb5c7b318613b3056";

    // Provide an empty update data payload with an empty array
    const emptyArrayUpdateData = {
      yourArrayField: [],
    };

    // Make an HTTP request to update the comment with empty array in the update data
    const res = await chai
      .request(app)
      .put(`/api/comments/${commentIdToUpdate}`)
      .set("Cookie", [authToken])
      .send(emptyArrayUpdateData);

    // Validate that the response indicates an error related to the update data
    res.should.have.status(400);
    res.body.should.be.a("object");
  });

  it("should update a comment with valid data and ignore additional fields", async () => {
    const commentIdToUpdate = "65603b07d7debecc85789dfb";

    // Provide valid data for the update with additional fields
    const validUpdateDataWithAdditionalFields = {
      comment: "Updated comment content.",
      author: "updatedAuthor",
      additionalField: "additionalValue", // Additional field not expected by the server
    };

    // Make a request to update the comment with additional fields
    const res = await chai
      .request(app)
      .put(`/api/comments/${commentIdToUpdate}`)
      .set("Cookie", [authToken])
      .send(validUpdateDataWithAdditionalFields);

    // Validate that the response indicates a successful comment update
    res.should.have.status(200);
    res.body.should.be.a("object");
  });

  it("should update a comment with partial update data", async () => {
    const commentIdToUpdate = "validCommentId";

    const partialUpdateData = {
      comment: "Updated comment content.",
    };
  });

  it("should handle server errors during comment update", async () => {
    const commentIdToUpdate = "6562dcb608a806628f5f29b5";

    // Mock a server error during the update process
    sinon
      .stub(Comment, "findByIdAndUpdate")
      .throws(new Error("Simulated server error"));

    // Make a request to update the comment
    const res = await chai
      .request(app)
      .put(`/api/comments/${commentIdToUpdate}`)
      .set("Cookie", [authToken])
      .send({ updatedField: "new value" });

    // Validate that the response indicates a server error
    res.should.have.status(500);
    res.body.should.be.a("object");

    // Restore the original function after the test
    Comment.findByIdAndUpdate.restore();
  });
});

describe("Delete comments", () => {
  let authToken; // Variable to store the authentication token

  before(async () => {
    try {
      // Perform user login and obtain the authentication token
      const loginCredentials = {
        email: "qj1@gmail.com",
        password: "qj1",
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
    } catch (error) {
      console.error("Error during login:", error);
      throw error; // Fail the test if there's an error during login
    }
  });

  it("should delete an existing comment", async () => {
    const commentIdToDelete = "6562dcb608a806628f5f29b5";

    const res = await chai
      .request(app)
      .delete(`/api/comments/${commentIdToDelete}`)
      .set("Cookie", [authToken]);

    if (res.status !== 200) {
      console.error("Server response:", res.body);
    }

    res.should.have.status(200);
    res.body.should.be.a("string");
    res.body.should.equal("Comment has been deleted!");
  });

  it("should not delete an existing comment without proper authorization", async () => {
    const invalidAuthToken = "0";

    const commentIdToDelete = "6562dcb608a806628f5f29b5";

    // Make a request to delete the comment without proper authorization
    const res = await chai
      .request(app)
      .delete(`/api/comments/${commentIdToDelete}`)
      .set("Cookie", [invalidAuthToken]);

    // Validate that the response indicates a lack of authentication
    res.should.have.status(401);
    res.body.should.be.a("string");
    res.body.should.equal("You are not authenticated!");
  });

  it("should handle server errors during comment deletion", async () => {
    const commentIdToDelete = "6562dcb608a806628f5f29b5";

    // Mock a server error during the deletion process
    sinon
      .stub(Comment, "findByIdAndDelete")
      .throws(new Error("Simulated server error"));

    // Make a request to delete the comment
    const res = await chai
      .request(app)
      .delete(`/api/comments/${commentIdToDelete}`)
      .set("Cookie", [authToken]);

    // Validate that the response indicates a server error
    res.should.have.status(500);
    res.body.should.be.a("object");

    // Restore the original function after the test
    Comment.findByIdAndDelete.restore();
  });
});

describe("Get Post Comments", () => {
  it("should retrieve comments for a specific post", async () => {
    const postId = "validPostId"; // Replace with a valid post ID

    const res = await chai
      .request(app)
      .get(`/api/comments/post/${postId}`);

    res.should.have.status(200);
    res.body.should.be.a("array");
    // Additional checks on the response body can be added here
  });

  it("should return an empty array if no comments are found for a post", async () => {
    const postId = "nonExistingPostId"; // Use a post ID that has no comments

    const res = await chai
      .request(app)
      .get(`/api/comments/post/${postId}`);

    res.should.have.status(200);
    res.body.should.be.a("array");
    res.body.length.should.be.eql(0);
  });

  // Mock server error
  it("should handle server errors", async () => {
    const postId = "validPostId"; // Replace with a valid post ID

    // Simulate a server error
    sinon.stub(Comment, "find").throws(new Error("Simulated server error"));

    const res = await chai
      .request(app)
      .get(`/api/comments/post/${postId}`);

    res.should.have.status(500);

    // Restore the original function after the test
    Comment.find.restore();
  });
});
