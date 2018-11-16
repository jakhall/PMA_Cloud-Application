import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function main(event, context) {

  const authProvider = event.requestContext.identity.cognitoAuthenticationProvider;
  const parts = authProvider.split(':');
  const userPoolIdParts = parts[parts.length - 3].split('/');
  const userPoolId = userPoolIdParts[userPoolIdParts.length - 1];
  const userPoolUserId = parts[parts.length - 1];


  const params = {
    TableName: "PROJECT_Table",

    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": event.requestContext.identity.cognitoIdentityId,
    }
  };

    try {
      const result = await dynamoDbLib.call("query", params);
      // Return the matching list of items in response body
      return success(result.Items);
    } catch (e) {
      return failure({ status: false });
    }
  }
