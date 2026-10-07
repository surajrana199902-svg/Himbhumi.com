process.env.NODE_ENV = 'production'

const { loadEnvConfig } = require('@next/env')

loadEnvConfig(process.cwd())
require('./.next/standalone/server.js')
