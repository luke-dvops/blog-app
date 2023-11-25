const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../index");
const should = chai.should();

chai.use(chaiHttp);

describe("Posts", () => {
  let postId;

  describe("/POST create post without login", () => {
    before((done) => {
      const newPost = {
        title: "test1",
        desc: "test1",
        photo:
          "https://images.pexels.com/photos/19168467/pexels-photo-19168467/free-photo-of-white-montain.jpeg?auto=compress&cs=tinysrgb&w=1600&lazy=load",
        username: "test1",
        userId: "65603b07d7debecc85789dfc",
        categories: ["demo"],
      };

      chai
        .request(app)
        .post("/api/posts/create")
        .send(newPost)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("title").eql("test1");
          res.body.should.have.property("desc").eql("test1");
          res.body.should.have.property("username").eql("test1");
          res.body.should.have
            .property("userId")
            .eql("65603b07d7debecc85789dfc");
          res.body.should.have.property("categories").eql(["demo"]);
          postId = res.body._id;

          console.log("Created post ID:", postId);
          done();
        });
    });

    it("it should create a new post without authentication", (done) => {
      done();
    });
  });

  describe("/DELETE delete post by ID", () => {
    it("it should delete a post by ID", (done) => {
      if (!postId) {
        return done(new Error("postId is not defined"));
      }

      chai
        .request(app)
        .delete(`/api/posts/${postId}`)
        .end((err, res) => {
          res.should.have.status(200);

          res.text.should.eql('"Post has been deleted!"');

          done();
        });
    });
  });
  describe("/DELETE delete post by ID", () => {
    it("it should handle deleting a post with an invalid ID", (done) => {
      const invalidPostId = "invalid_post_id";

      chai
        .request(app)
        .delete(`/api/posts/${invalidPostId}`)
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property("name").eql("CastError");
          res.body.should.have.property("kind").eql("ObjectId");
          res.body.should.have.property("path").eql("_id");
          res.body.should.have.property("value").eql(invalidPostId);

          done();
        });
    });
  });

  describe("/POST create post with missing required fields", () => {
    it("it should return a validation error for missing required fields", (done) => {
      const incompletePost = {
        title: "test4",
        // Missing required fields: userId, username, desc
      };

      chai
        .request(app)
        .post("/api/posts/create")
        .send(incompletePost)
        .end((err, res) => {
          if (err) {
            console.error(err);
          }

          res.should.have.status(500);

          res.body.should.be.a("object");

          res.body.should.deep.equal({
            errors: {
              userId: {
                name: "ValidatorError",
                message: "Path `userId` is required.",
                properties: {
                  message: "Path `userId` is required.",
                  type: "required",
                  path: "userId",
                },
                kind: "required",
                path: "userId",
              },
              username: {
                name: "ValidatorError",
                message: "Path `username` is required.",
                properties: {
                  message: "Path `username` is required.",
                  type: "required",
                  path: "username",
                },
                kind: "required",
                path: "username",
              },
              desc: {
                name: "ValidatorError",
                message: "Path `desc` is required.",
                properties: {
                  message: "Path `desc` is required.",
                  type: "required",
                  path: "desc",
                },
                kind: "required",
                path: "desc",
              },
            },
            _message: "Post validation failed",
            name: "ValidationError",
            message:
              "Post validation failed: userId: Path `userId` is required., username: Path `username` is required., desc: Path `desc` is required.",
          });

          done();
        });
    });
  });
  describe("/POST create post with duplicate title", () => {
    it("it should return an error for duplicate title", (done) => {
      const duplicatePost = {
        title: "test3",
        desc: "test3",
        photo:
          "https://images.pexels.com/photos/19168467/pexels-photo-19168467/free-photo-of-white-montain.jpeg?auto=compress&cs=tinysrgb&w=1600&lazy=load",
        username: "test1",
        userId: "65603b07d7debecc85789dfc",
        categories: ["demo"],
      };

      chai
        .request(app)
        .post("/api/posts/create")
        .send(duplicatePost)
        .end((err, res) => {
          if (err) {
            console.error(err);
          }

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

          done();
        });
    });
  });

  describe("/PUT update post", () => {
    it("it should update a post", (done) => {
      const postIdToUpdate = "65607714f96b0d433b4d13da";
      const updatedPostData = {
        title: "test2",
        desc: "test22",
        photo:
          "https://images.pexels.com/photos/19168467/pexels-photo-19168467/free-photo-of-white-montain.jpeg?auto=compress&cs=tinysrgb&w=1600&lazy=load",
        username: "test1",
        userId: "65603b07d7debecc85789dfc",
        categories: ["demo"],
      };

      chai
        .request(app)
        .put(`/api/posts/${postIdToUpdate}`)
        .send(updatedPostData)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("title").eql("test2");
          res.body.should.have.property("desc").eql("test22");
          res.body.should.have.property("username").eql("test1");
          res.body.should.have
            .property("userId")
            .eql("65603b07d7debecc85789dfc");
          res.body.should.have.property("categories").eql(["demo"]);
          done();
        });
    });
  });
  describe("/PUT update post - Missing Data", () => {
    it("it should update a post even with missing data", (done) => {
      const postIdToUpdate = "65607714f96b0d433b4d13da";
      const updatedPostData = {
        title: "test2",
      };

      chai
        .request(app)
        .put(`/api/posts/${postIdToUpdate}`)
        .send(updatedPostData)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("title").eql("test2");

          done();
        });
    });
  });
  describe("/PUT update post - Invalid post ID", () => {
    it("it should return an error for updating with an invalid post ID", (done) => {
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
});
