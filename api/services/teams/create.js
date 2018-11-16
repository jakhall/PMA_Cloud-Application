import uuid from "uuid";
import AWS from "aws-sdk";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export function main(event, context, callback) {
  // Request body is passed in as a JSON encoded string in 'event.body'
  const data = JSON.parse(event.body);

  const authProvider = event.requestContext.identity.cognitoAuthenticationProvider;
  const parts = authProvider.split(':');
  const userPoolIdParts = parts[parts.length - 3].split('/');
  const userPoolId = userPoolIdParts[userPoolIdParts.length - 1];
  const userPoolUserId = parts[parts.length - 1];

  const params = {
      TableName: "TEAM_Table",
      Item: {
        linkId:  uuid.v1(),
        userId: event.requestContext.identity.cognitoIdentityId,
        projectId: data.projectId,
        role: data.role,
        addedAt: Date.now()
      }
    };

    dynamoDb.put(params, (error, data) => {
      // Set response headers to enable CORS (Cross-Origin Resource Sharing)
      const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      };

      // Return status code 500 on error
      if (error) {
        const response = {
          statusCode: 500,
          headers: headers,
          body: JSON.stringify({ status: false })
        };
        callback(null, response);
        return;
      }

      // Return status code 200 and the newly created item
      const response = {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify(params.Item)
      };
      callback(null, response);
    });
}
