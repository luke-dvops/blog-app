const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../index"); // Replace with the actual path to your Express app
const { expect } = chai;

chai.use(chaiHttp);

const registerPath = "/api/auth/register";
const loginPath = "/api/auth/login";

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

it("should handle duplicate username", async () => {
  try {
    const res = await chai.request(app).post(registerPath).send({
      username: "luke",
      email: "anotheruser@gmail.com",
      password: "654321",
    });

    expect(res).to.have.status(400);
    expect(res.body).to.have.property("error").to.equal("Username is already in use. Please choose a new username.");
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

  after((done) => {
    setTimeout(() => {
      console.log("Terminating the test suite.");
      process.exit();
    }, 1000);
  
    done();

});

});