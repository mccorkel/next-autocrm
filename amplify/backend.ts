import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { configureSES } from './config/ses';
import { Stack } from 'aws-cdk-lib';
import {
  AuthorizationType,
  Cors,
  LambdaIntegration,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { defineFunction } from "@aws-amplify/backend";

// Define the Lambda function for email processing API
const emailProcessingFunction = defineFunction({
  name: "email-processing-api",
  entry: "app/api/email/route.ts"
});

export const backend = defineBackend({
  auth: {
    ...auth,
    iam: {
      authenticated: {
        policies: [
          {
            document: () => configureSES()
          }
        ]
      }
    }
  },
  data,
  emailProcessingFunction
});

// Create API stack
const apiStack = backend.createStack("api-stack");

// Create REST API
const emailApi = new RestApi(apiStack, "EmailApi", {
  restApiName: "emailApi",
  deploy: true,
  deployOptions: {
    stageName: "prod",
  },
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS,
    allowHeaders: ["x-api-key", ...Cors.DEFAULT_HEADERS],
  },
});

// Create Lambda integration
const lambdaIntegration = new LambdaIntegration(
  backend.emailProcessingFunction.resources.lambda
);

// Create email endpoint
const emailPath = emailApi.root.addResource("email", {
  defaultMethodOptions: {
    authorizationType: AuthorizationType.IAM,
  },
});

// Add POST method
emailPath.addMethod("POST", lambdaIntegration);

// Create IAM policy for API access
const apiPolicy = new Policy(apiStack, "EmailApiPolicy", {
  statements: [
    new PolicyStatement({
      actions: ["execute-api:Invoke"],
      resources: [
        `${emailApi.arnForExecuteApi("POST", "/email", "prod")}`,
      ],
    }),
  ],
});

// Attach policy to authenticated and unauthenticated roles
backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(apiPolicy);
backend.auth.resources.unauthenticatedUserIamRole.attachInlinePolicy(apiPolicy);

// Add outputs
backend.addOutput({
  custom: {
    API: {
      [emailApi.restApiName]: {
        endpoint: emailApi.url,
        region: Stack.of(emailApi).region,
        apiName: emailApi.restApiName,
      },
    },
  },
});
