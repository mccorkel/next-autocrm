import { defineStorage } from '@aws-amplify/backend';

const storage = defineStorage({
  name: 'email',
  bucket: {
    name: 'tigerpandatv-mail'
  },
  access: (allow) => ({
    guest: allow.read()  // Allow read access for API key auth
  })
});

export default storage; 
