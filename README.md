# Service Cache

This package adds support to cache return values from service calls in nodejs.

## Install

npm install @cyclonecode/service-cache

## Cache method return value

    import { ServiceCache } from 'service-cache'

    class MyService {
        @ServiceCache()
        // @ServiceCache({ key: 'myKey' })
        // @ServiceCache({ ttl: 60000 })
        // @ServiceCache(( key: 'myKey', ttl: 6000 })
        fetchFromApi() {
            // return response from external api.
        }
    }

## Cache all method return values in a class

    import { ServiceCache } from 'service-cache'

    @ServiceCache()
    // @ServiceCache({ key: 'myKey' })
    // @ServiceCache({ ttl: 60000 })
    // @ServiceCache(( key: 'myKey', ttl: 6000 })
    class MyService {
        fetchFromTwitter() {
            // return response from twitter api.
        }

        fetchFromInstagram() {
            // return response from instagram.
        }
    }

## Configuration

The package is using `dotenv` to access environment variables; you can change the default cache key and ttl using:

    CACHE_KEY=defaultCacheKey
    CACHE_TTL=5000
