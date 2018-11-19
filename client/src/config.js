export default {
  s3: {
    REGION: "eu-west-2",
    BUCKET: "pma-app-uploads"
  },
  apiGateway: {
    REGION: "eu-west-2",
    URL: "https://wt0ab4foj5.execute-api.eu-west-2.amazonaws.com/prod"
  //  URL: "https://awwhvvzpta.execute-api.eu-west-2.amazonaws.com/prod"
  },
  cognito: {
    REGION: "eu-west-2",
    USER_POOL_ID: "eu-west-2_5714IGrlU",
    APP_CLIENT_ID: "6j3sb4nlshck3i2icdh4aaaofm",
    IDENTITY_POOL_ID: "eu-west-2:488c360f-e42b-43ec-b7a4-5f641794abc5"
  },
  options: {
    selectedSearch: 0
  }
};
