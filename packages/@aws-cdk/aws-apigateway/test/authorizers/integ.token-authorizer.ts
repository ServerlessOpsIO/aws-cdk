import lambda = require('@aws-cdk/aws-lambda');
import { App, Stack } from '@aws-cdk/core';
import path = require('path');
import { AuthorizationType, LambdaTokenAuthorizer, MockIntegration, PassthroughBehavior, RestApi } from '../../lib';

const app = new App();
const stack = new Stack(app, 'MyStack');

const authorizerFn = new lambda.Function(stack, 'MyAuthorizerFunction', {
  runtime: lambda.Runtime.NODEJS_10_X,
  handler: 'index.handler',
  code: lambda.AssetCode.fromAsset(path.join(__dirname, 'integ.token-authorizer.handler'))
});

const restapi = new RestApi(stack, 'MyRestApi');

const authorizer = new LambdaTokenAuthorizer(stack, 'MyAuthorizer', {
  function: authorizerFn,
  restApi: restapi,
  headerName: 'x-auth-header'
});

restapi.root.addMethod('ANY', new MockIntegration({
  integrationResponses: [
    { statusCode: '200' }
  ],
  passthroughBehavior: PassthroughBehavior.NEVER,
  requestTemplates: {
    'application/json': '{ "statusCode": 200 }',
  },
}), {
  methodResponses: [
    { statusCode: '200' }
  ],
  authorizer,
  authorizationType: AuthorizationType.CUSTOM
});