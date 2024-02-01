const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../index"); // Replace with the actual path to your Express app
const { expect } = chai;

chai.use(chaiHttp);

const registerPath = "/api/auth/register";
const loginPath = "/api/auth/login";
const existingUsernamePath = "/api/auth/check-username";
const existingEmailPath = "/api/auth/check-email";
const deleteByEmailPath = "/api/auth/deleteUser/:email";
describe("Testing Authentication Routes", () => {
  let token; // Variable to store the authentication token for further requests

 // Test case for user registration
 it("should register a new user successfully", async () => {
  try {
    const res = await chai.request(app).post(registerPath).send({
      username: "luke",
      email: "luketankl@gmail.com",
      password: "123456",
    });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property("username").to.equal("luke");
  } catch (error) {
    throw error;
  }
});

it('should return an error message if username and email combination is already in use', async () => {
  // Define an existing user with the same username and email
  const existingUser = {
    username: 'luke',
    email: 'luketankl@gmail.com'
  };

  // Register the existing user
  await chai.request(app).post('/api/auth/register').send(existingUser);

  // Try to register the existing user again
  const response = await chai.request(app).post('/api/auth/register').send(existingUser);

  // Assert that the response status is 400 (Bad Request)
  expect(response).to.have.status(400);

  // Assert that the response body contains the expected error message
  expect(response.body).to.have.property('error').to.equal('Username and email combination is already in use. Please choose a new combination.');
});

it("should continue register a new user successfully", async () => {
  try {
    const res = await chai
      .request(app)
      .post("/api/auth/register")
      .send({
        username: "uniqueusername",
        email: "uniqueemail@example.com",
        password: "password123",
      });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property("username").to.equal("uniqueusername");
    expect(res.body).to.have.property("email").to.equal("uniqueemail@example.com");
    // Add more assertions as needed

  } catch (error) {
    throw error;
  }
});


  // Test case for user login
  it("should login a user and return an authentication token", async () => {
    const res = await chai.request(app).post(loginPath).send({
      email: "luketankl@gmail.com",
      password: "123456",
    });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property("username").to.equal("luke");
    expect(res).to.have.cookie("token"); // Check if the response has a 'token' cookie

    // Save the token for further requests (e.g., authenticated routes)
    token = res.headers["set-cookie"][0].split(";")[0].split("=")[1];
  });

  // Test case for user login with incorrect username
  it("should return an error when attempting to login with incorrect username", async () => {
    const res = await chai.request(app).post(loginPath).send({
      email: "wrongemail@gmail.com",
      password: "123456",
    });

    expect(res).to.have.status(404);
    expect(res.body).to.have.property('error', 'User not found!');
  });

  // Test case for user login with incorrect password
  it("should return an error when attempting to login with incorrect password", async () => {
    const res = await chai.request(app).post(loginPath).send({
      email: "luketankl@gmail.com",
      password: "wrongpassword",
    });

    expect(res).to.have.status(401);
    expect(res.body).to.have.property("error").to.equal("Wrong credentials!");
  });

  // Test case for refetching user information
  it("should refetch user information after login", async () => {
    // Assuming you have the 'token' variable containing the JWT from a successful login

    const res = await chai
      .request(app)
      .get("/api/auth/refetch")
      .set("Cookie", `token=${token}`); // Set the token in the 'Cookie' header

    // Log the response to the console for further inspection
    console.log("Response from Refetch:", res.body);

    // Your assertions based on the response
    expect(res).to.have.status(200);
    // Add more assertions based on the expected response
  });




  const existingUser = {
    username: "luke"
  };

  // Before running the tests, register an existing user
  before(async () => {
    try {
      // Register the existing user
      await chai.request(app).post(registerPath).send(existingUser);
    } catch (error) {
      throw error;
    }
  });

  // Test case for checking an existing username
  it("should indicate that the username exists", async () => {
    try {
      const username = existingUser.username;
      const res = await chai.request(app).get(`${existingUsernamePath}/${username}`);

      expect(res).to.have.status(200);
      expect(res.body).to.deep.equal({ exists: true, message: "Username is already in use. Please choose a new username." });
    } catch (error) {
      throw error;
    }
  });

  // Test case for checking a non-existing username
  it("should indicate that the username is available", async () => {
    try {
      const username = "nonexistinguser";
      const res = await chai.request(app).get(`${existingUsernamePath}/${username}`);

      expect(res).to.have.status(200);
      expect(res.body).to.deep.equal({ exists: false, message: "Username is available." });
    } catch (error) {
      throw error;
    }
  });


  const existingEmail = {
    email: "luketankl@gmail.com"
  };

  // Before running the tests, register an existing user
  before(async () => {
    try {
      // Register the existing user
      await chai.request(app).post(registerPath).send(existingEmail);
    } catch (error) {
      throw error;
    }
  });

  // Test case for checking an existing username
  it("should indicate that the email exists", async () => {
    try {
      const email = existingEmail.email;
      const res = await chai.request(app).get(`${existingEmailPath}/${email}`);

      expect(res).to.have.status(200);
      expect(res.body).to.deep.equal({ exists: true, message: "Email is already in use. Please use a different email address." });
    } catch (error) {
      throw error;
    }
  });

  // Test case for checking a non-existing username
  it("should indicate that the email is available", async () => {
    try {
      const email = "nonexistinguser@gmail.com";
      const res = await chai.request(app).get(`${existingEmailPath}/${email}`);

      expect(res).to.have.status(200);
      expect(res.body).to.deep.equal({ exists: false, message: "Email is available." });
    } catch (error) {
      throw error;
    }
  });



// Test case for user deletion by email
it("should delete Luke user by email", async () => {
  try {
    // Make a request to delete the user by email
    const deleteByEmailRes = await chai
      .request(app)
      .delete(deleteByEmailPath.replace(":email", "luketankl@gmail.com"))
      .set("Authorization", `Bearer ${token}`); // Set the authorization header with the token

    // Check if the user is deleted successfully
    expect(deleteByEmailRes).to.have.status(200);
    expect(deleteByEmailRes.body).to.have.property("message").to.equal("User deleted successfully!");
  } catch (error) {
    throw error;
  }
});


// Test case for user deletion by email
it("should delete UniqueUsername user by email", async () => {
  try {
    // Make a request to delete the user by email
    const deleteByEmailRes = await chai
      .request(app)
      .delete(deleteByEmailPath.replace(":email", "uniqueemail@example.com"))
      .set("Authorization", `Bearer ${token}`); // Set the authorization header with the token

    // Check if the user is deleted successfully
    expect(deleteByEmailRes).to.have.status(200);
    expect(deleteByEmailRes.body).to.have.property("message").to.equal("User deleted successfully!");
  } catch (error) {
    throw error;
  }
});

  after((done) => {
    setTimeout(() => {
      console.log("Terminating the test suite.");
      process.exit();
    }, 1000);
  
    done();

});

});