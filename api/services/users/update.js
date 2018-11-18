import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";


export async function main(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: "USER_Table",
    Key: {
      userId: event.pathParameters.id
    },
    UpdateExpression: "SET firstName = :firstName, lastName = :lastName, bio = :bio, skills = :skills",
    ExpressionAttributeValues: {
      ":firstName": data.firstName,
      ":lastName": data.lastName,
      ":bio": data.bio,
      ":skills": data.skills
    },
    ReturnValues: "ALL_NEW"
  };

  try {
    const result = await dynamoDbLib.call("update", params);
    return success({ status: true });
  } catch (e) {
    console.log(e);
    return failure({ status: e });
  }
}
