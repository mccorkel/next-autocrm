import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { configureIAM } from './config/iam';

export const backend = defineBackend({
  auth,
  data,
  customHandlers: {
    onStackCreate: (stack) => {
      const adminRole = configureIAM(stack);
      // Attach the role to the auth resource
      auth.resources.userPool.addToRolePolicy(adminRole);
    }
  }
});
