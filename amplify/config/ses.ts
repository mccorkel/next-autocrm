import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';

export const configureSES = () => new PolicyStatement({
  effect: Effect.ALLOW,
  actions: ['ses:SendEmail', 'ses:SendRawEmail'],
  resources: ['*']
}); 