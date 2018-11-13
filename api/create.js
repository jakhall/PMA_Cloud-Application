import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
  const data = JSON.parse(event.body);

  var params = {
    TableName: "PROJECT_Table",
    Item: {
      userId: event.requestContext.identity.cognitoIdentityId,
      projectId: uuid.v1(),
      content: data.content,
      createdAt: Date.now()
    }
  };

  try {
    await dynamoDbLib.call("put", params);
    return success(params.Item);
  } catch (e) {
    console.log(e);
    return failure({status: false});
  }

  params = {
    TableName: "TEAM_Table",
    Item: {
      userId: event.requestContext.identity.cognitoIdentityId,
      projectId: uuid.v1(),
      role: data.role,
      addedAt: Date.now()
    }
  };

  try {
      await dynamoDbLib.call("put", params);
      return success(params.Item);
    } catch (e) {
      console.log(e);
      return failure({status: false});
    }


}
