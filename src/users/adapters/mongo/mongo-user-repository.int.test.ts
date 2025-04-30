import { Model } from "mongoose";
import { TestApp } from "../../../tests/utils/test-app";
import { MongoUser } from "./mongo-user";
import { MongoUserRepository } from "./mongo-user-repository";
import { getModelToken } from "@nestjs/mongoose";
import { testUsers } from "../../../users/tests/user-seeds";

describe("MongoUserRepository", () => {
  let app: TestApp;
  let model: Model<MongoUser.SchemaClass>;
  let repository: MongoUserRepository;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();

    model = app.get<Model<MongoUser.SchemaClass>>(
      getModelToken(MongoUser.CollectionName)
    );

    repository = new MongoUserRepository(model);
  });

  describe("findByEmailAddress", () => {
    it("should find a user by email address", async () => {
      const record = new Model({
        _id: testUsers.alice.props.id,
        emailAddress: testUsers.alice.props.emailAddress,
        password: testUsers.alice.props.password,
      }); //?

      await record.save();

      const user = await repository.findbyEmailAddress(
        testUsers.alice.props.emailAddress
      );

      expect(user!.props).toEqual(testUsers.alice.props);
    });
  });

  afterEach(async () => {
    await app.cleanup();
  });
});
