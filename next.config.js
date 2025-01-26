/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SERVICE_ACCOUNT_EMAIL: process.env.SERVICE_ACCOUNT_EMAIL,
    SERVICE_ACCOUNT_PASSWORD: process.env.SERVICE_ACCOUNT_PASSWORD,
    NEXT_PUBLIC_AWS_USER_POOL_ID: process.env.NEXT_PUBLIC_AWS_USER_POOL_ID,
    NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION,
    AWS_REGION: process.env.AWS_REGION,
    GRAPHQL_URL: process.env.GRAPHQL_URL
  }
}

module.exports = nextConfig
