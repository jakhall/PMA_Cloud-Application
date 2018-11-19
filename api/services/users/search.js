import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function main(event, context) {

  var params = null;

  if(!event.pathParameters.search.localeCompare("_all")){
  var params = {
        TableName: "USER_Table"
    };
  } else {
      var params = {
      TableName: "USER_Table",
      FilterExpression: "begins_with(#firstname, :qStandard) OR begins_with(#firstname, :qCapital) OR begins_with(#lastname, :qStandard) OR begins_with(#lastname, :qCapital) OR begins_with(#username, :qStandard) OR begins_with(#username, :qCapital)",
      ExpressionAttributeNames: {
       '#firstname': 'firstName',
       '#lastname': 'lastName',
       '#username': 'username'
      },
      ExpressionAttributeValues: {
       ':qStandard': event.pathParameters.search,
       ':qCapital': event.pathParameters.search.substring(0, 1).toUpperCase() + event.pathParameters.search.substring(1).toLowerCase()
      }
    };
  }

  try {
    const result = await dynamoDbLib.call("scan", params);
    return success(result.Items);

  } catch (e) {
    return failure({ status: e + " " + params.FilterExpression});
  }
}
