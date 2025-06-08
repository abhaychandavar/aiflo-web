const settings = {
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    services: {
        auth: {
            baseURL: process.env.AUTH_SERVICE_BASE_URL || process.env.NEXT_PUBLIC_AUTH_SERVICE_BASE_URL || 'http://127.0.0.1:8081'
        },
        flow: {
            baseURL: process.env.FLOW_SERVICE_BASE_URL || process.env.NEXT_PUBLIC_FLOW_SERVICE_BASE_URL || 'http://127.0.0.1:8080'
        }
    },
    internalApiAccessToken: process.env.INTERNAL_API_ACCESS_TOKEN || 'secretKey',
    nextApi: process.env.NEXT_PUBLIC_API_BASE_URL || '',
    brandName: 'aiflo'
}

export default settings;