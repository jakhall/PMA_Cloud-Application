import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function main(event, context) {

  const params = {
    TableName: "PROJECT_Table",

    FilterExpression: "#userId = :userId",
    ExpressionAttributeNames: {
      "#userId" : 'userId'
    },
    ExpressionAttributeValues: {
      ":userId": event.pathParameters.id
    }
  };

    try {
      const result = await dynamoDbLib.call("scan", params);
      // Return the matching list of items in response body
      return success(result.Items);
    } catch (e) {
      return failure({ status: e});
    }
  }
