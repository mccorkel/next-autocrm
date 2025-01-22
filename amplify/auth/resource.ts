import { defineAuth } from "@aws-amplify/backend";

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true
  },
  userAttributes: {
    givenName: {
      required: false
    },
    familyName: {
      required: false
    },
  },
  groups: ["ADMIN", "SUPER", "AGENT"],
  multifactor: {
    mode: 'OPTIONAL',
    totp: true
  }
});
