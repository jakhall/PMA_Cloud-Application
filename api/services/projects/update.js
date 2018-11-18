import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";


export async function main(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: "PROJECT_Table",

    Key: {
      projectId: event.pathParameters.id
    },
    UpdateExpression: "SET title = :title, description = :description, projectStatus = :projectStatus",
    ExpressionAttributeValues: {
      ":title": data.title,
      ":description": data.description,
      ":projectStatus": data.projectStatus
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
