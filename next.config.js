/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SERVICE_ACCOUNT_EMAIL: process.env.SERVICE_ACCOUNT_EMAIL,
    SERVICE_ACCOUNT_PASSWORD: process.env.SERVICE_ACCOUNT_PASSWORD,
    NEXT_PUBLIC_AWS_USER_POOL_ID: process.env.NEXT_PUBLIC_AWS_USER_POOL_ID,
    NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION,
    AWS_REGION: process.env.AWS_REGION,
    GRAPHQL_URL: process.env.GRAPHQL_URL,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY
  }
}

module.exports = nextConfig
