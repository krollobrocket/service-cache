# Service Cache

This package adds support to cache return values from service calls in nodejs.

## Install

npm install @cyclonecode/service-cache

## Usage

    import { ServiceCache } from 'service-cache'

    class MyService {
        @ServiceCache({ key: 'fooBar', ttl: 60 * 1000 })
        fetchFromApi() {
            // return response from external api.
        }
    }

## Configuration

The package is using `dotenv` to access environment variables; you can change the default cache key and ttl using:

    CACHE_KEY=defaultCacheKey
    CACHE_TTL=5000
