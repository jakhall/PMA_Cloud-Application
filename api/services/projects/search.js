import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function main(event, context) {
  const params = {
    TableName: "PROJECT_Table",
    FilterExpression: "begins_with(firstName, :search) OR begins_with(lastName, :search) OR begins_with(username, :search)",
    ExpressionAttributeValues:  {
      ":search":{"S": event.pathParameters.search}
    }
  };

  try {
    const result = await dynamoDbLib.call("scan", params);
    return success(result.Items);
  } catch (e) {
    return failure({ status: e });
  }
}
