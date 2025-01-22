// import { Stack } from 'aws-cdk-lib';
// import * as iam from 'aws-cdk-lib/aws-iam';

// export function configureIAM(stack: Stack) {
//   // Create role for ADMIN group
//   const adminRole = new iam.Role(stack, 'AdminGroupRole', {
//     assumedBy: new iam.ServicePrincipal('cognito-idp.amazonaws.com'),
//     description: 'Role for ADMIN group in Cognito',
//   });

//   // Add policy to allow Cognito admin actions
//   adminRole.addToPolicy(new iam.PolicyStatement({
//     effect: iam.Effect.ALLOW,
//     actions: [
//       'cognito-idp:ListUsers',
//       'cognito-idp:AdminCreateUser',
//       'cognito-idp:AdminAddUserToGroup'
//     ],
//     resources: ['*']
//   }));

//   return adminRole;
// } 