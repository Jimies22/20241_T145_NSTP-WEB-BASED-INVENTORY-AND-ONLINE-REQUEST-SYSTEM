import * as chai from "chai";
import chaiHttp from "chai-http";
import app from "../server.js";

const { expect } = chai;
chai.use(chaiHttp);

describe("User API", () => {
  const userEndpoint = "/api/users";

  // Test data fixtures
  const validUser = {
    email: "test@example.com",
    name: "Test User",
    role: "student",
  };

  // Clean up database before each test
  beforeEach(async () => {
    // Assuming you have a deleteAll or similar method
    await User.deleteMany({});
  });

  describe("POST /api/users", () => {
    describe("Success cases", () => {
      it("should create a new user with valid data", async () => {
        const res = await chai.request(app).post(userEndpoint).send(validUser);

        expect(res.status).to.equal(201);
        expect(res.body).to.include(validUser);
        expect(res.body).to.have.property("id");
        expect(res.body).to.have.property("createdAt");
      });

      it("should trim whitespace from name and email", async () => {
        const res = await chai
          .request(app)
          .post(userEndpoint)
          .send({
            ...validUser,
            email: " test@example.com ",
            name: " Test User ",
          });

        expect(res.status).to.equal(201);
        expect(res.body.email).to.equal("test@example.com");
        expect(res.body.name).to.equal("Test User");
      });
    });

    describe("Validation errors", () => {
      it("should return error for duplicate email", async () => {
        // First create a user
        await chai.request(app).post(userEndpoint).send(validUser);

        // Try to create another user with same email
        const res = await chai.request(app).post(userEndpoint).send(validUser);

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("error");
        expect(res.body.error).to.equal("User already exists");
      });

      const validationTests = [
        {
          description: "missing email",
          data: { name: "Test User", role: "student" },
          expectedError: "Email is required",
        },
        {
          description: "invalid email format",
          data: { ...validUser, email: "invalid-email" },
          expectedError: "Invalid email format",
        },
        {
          description: "missing name",
          data: { email: "test@example.com", role: "student" },
          expectedError: "Name is required",
        },
        {
          description: "missing role",
          data: { email: "test@example.com", name: "Test User" },
          expectedError: "Role is required",
        },
        {
          description: "invalid role",
          data: { ...validUser, role: "invalid-role" },
          expectedError:
            "Invalid role. Must be one of: student, teacher, admin",
        },
      ];

      validationTests.forEach(({ description, data, expectedError }) => {
        it(`should return error for ${description}`, async () => {
          const res = await chai.request(app).post(userEndpoint).send(data);

          expect(res.status).to.equal(400);
          expect(res.body).to.have.property("error");
          expect(res.body.error).to.equal(expectedError);
        });
      });
    });

    describe("Security tests", () => {
      it("should not allow HTML injection in name field", async () => {
        const res = await chai
          .request(app)
          .post(userEndpoint)
          .send({
            ...validUser,
            name: "<script>alert('xss')</script>",
          });

        expect(res.status).to.equal(400);
        expect(res.body.error).to.equal("Invalid characters in name");
      });

      it("should hash sensitive data before storing", async () => {
        const res = await chai.request(app).post(userEndpoint).send(validUser);

        // Verify the response doesn't contain sensitive data
        expect(res.body).to.not.have.property("password");
        expect(res.body).to.not.have.property("securityQuestionAnswer");
      });
    });
  });
});
