import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { configureSES } from './config/ses';
import { Stack } from 'aws-cdk-lib';
// import { configureIAM } from './config/iam';

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
  data
});
