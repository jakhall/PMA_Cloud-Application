import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function main(event, context) {
  const params = {
    TableName: "PROJECT_Table",
    FilterExpression: "begins_with(#title, :qStandard) OR begins_with(#title, :qCapital)",
    ExpressionAttributeNames: {
     '#title': 'title'
    },
    ExpressionAttributeValues: {
     ':qStandard': event.pathParameters.search,
     ':qCapital': event.pathParameters.search.substring(0, 1).toUpperCase() + event.pathParameters.search.substring(1).toLowerCase()
    }
  };

  try {
    const result = await dynamoDbLib.call("scan", params);
    return success(result.Items);

  } catch (e) {
    return failure({ status: e + " " + params.FilterExpression});
  }
}
