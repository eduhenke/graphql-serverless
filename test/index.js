/**
 * Copyright (c) 2018, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const { assert } = require('chai')
const httpMocks = require('node-mocks-http')
const { makeExecutableSchema } = require('graphql-tools')
const { app } = require('webfunc')
const { graphqlHandler, graphqlError } = require('../src/index')

/*eslint-disable */
describe('index', () => 
	describe('#handleEvent: 01', () => 
		it(`Should fail if the query does not match the specified routing.`, () => {
			/*eslint-enable */
			const req_01 = httpMocks.createRequest({
				method: 'GET',
				headers: {
					origin: 'http://localhost:8080',
					referer: 'http://localhost:8080'
				},
				_parsedUrl: {
					pathname: '/'
				}
			})
			const res_01 = httpMocks.createResponse()

			app.reset()
			app.all('/users/:graphiqlpath', graphqlHandler({ schema: {} }), () => null)
			const fn = app.handleEvent()

			const result_01 = fn(req_01, res_01).then(() => {
				assert.equal(res_01.statusCode, 404)
				assert.equal(res_01._getData(), `Endpoint '/' for method GET not found.`)
			})

			return Promise.all([result_01])
		})))

/*eslint-disable */
describe('index', () => 
	describe('#handleEvent: 02', () => 
		it(`Should succeed if the query matches the specified routing.`, () => {
			/*eslint-enable */

			const schema = `
			type Product {
				id: ID!
				name: String!
				shortDescription: String
			}

			type Query {
				# ### GET products
				#
				# _Arguments_
				# - **id**: Product's id (optional)
				products(id: Int): [Product]
			}

			schema {
				query: Query
			}
			`
			const productMocks = [{ id: 1, name: 'Product A', shortDescription: 'First product.' }, { id: 2, name: 'Product B', shortDescription: 'Second product.' }]
			const productResolver = {
				Query: {
					products(root, { id }, context) {
						const results = id ? productMocks.filter(p => p.id == id) : productMocks
						if (results)
							return results
						else
							throw graphqlError(404, `Product with id ${id} does not exist.`)
					}
				}
			}

			const executableSchema = makeExecutableSchema({
				typeDefs: schema,
				resolvers: productResolver
			})

			const graphqlOptions = {
				schema: executableSchema,
				graphiql: true,
				endpointURL: "/graphiql"
			}

			const uri = 'users/graphiql'
			const req_01 = httpMocks.createRequest({
				method: 'GET',
				headers: {
					origin: 'http://localhost:8080',
					referer: 'http://localhost:8080',
					accept: 'application/json'
				},
				_parsedUrl: {
					pathname: uri
				},
				url: uri,
				body: { 
					query: `
						query {
							products(id: 1) {
								name
							}
						}`,
					variables: null 
				}
			})
			const res_01 = httpMocks.createResponse()

			app.reset()
			app.all(['/users', '/users/graphiql'], graphqlHandler(graphqlOptions), () => null)
			const fn = app.handleEvent()

			const result_01 = fn(req_01, res_01).then(() => {
				assert.equal(res_01.statusCode, 200)
				const html = res_01._getData()
				assert.isOk(html)
				assert.equal(typeof(html), 'string')
				let htmlJson
				try {
					htmlJson = JSON.parse(html)
				}
				catch(err) {
					assert.isOk(err)
					htmlJson = null
				}
				assert.isOk(htmlJson, `Response should be a json object.`)
				assert.isOk(htmlJson.data, `Response should be a json object with a defined 'data' property.`)
				assert.isOk(htmlJson.data.products, `Response should be a json object with a defined 'data.products' property.`)
				assert.isOk(htmlJson.data.products.length > 0, `Response's 'data.products' must be an array with at least one element.`)
				assert.equal(htmlJson.data.products[0].name, 'Product A')
			})

			return Promise.all([result_01])
		})))


/*eslint-disable */
describe('index', () => 
	describe('#handleEvent: 03', () => 
		it(`Should serve a graphiql interface`, () => {
			/*eslint-enable */

			const schema = `
			type Product {
				id: ID!
				name: String!
				shortDescription: String
			}

			type Query {
				# ### GET products
				#
				# _Arguments_
				# - **id**: Product's id (optional)
				products(id: Int): [Product]
			}

			schema {
				query: Query
			}
			`
			const productMocks = [{ id: 1, name: 'Product A', shortDescription: 'First product.' }, { id: 2, name: 'Product B', shortDescription: 'Second product.' }]
			const productResolver = {
				Query: {
					products(root, { id }, context) {
						const results = id ? productMocks.filter(p => p.id == id) : productMocks
						if (results)
							return results
						else
							throw graphqlError(404, `Product with id ${id} does not exist.`)
					}
				}
			}

			const executableSchema = makeExecutableSchema({
				typeDefs: schema,
				resolvers: productResolver
			})

			const graphqlOptions = {
				schema: executableSchema,
				graphiql: true,
				endpointURL: "/graphiql"
			}

			const req_01 = httpMocks.createRequest({
				method: 'GET',
				headers: {
					origin: 'http://localhost:8080',
					referer: 'http://localhost:8080',
					accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
				},
				_parsedUrl: {
					pathname: '/users/brendan/graphiql'
				},
				url: '/users/brendan/graphiql'
			})
			const res_01 = httpMocks.createResponse()
			const req_02 = httpMocks.createRequest({
				method: 'GET',
				headers: {
					origin: 'http://localhost:8080',
					referer: 'http://localhost:8080',
					accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
				},
				_parsedUrl: {
					pathname: '/users/graphiql'
				},
				url: '/users/graphiql'
			})
			const res_02 = httpMocks.createResponse()

			app.reset()
			app.all(['/users/:username', '/users/:username/graphiql'], graphqlHandler(graphqlOptions), () => null)
			const fn = app.handleEvent()

			const result_01 = fn(req_01, res_01).then(() => {
				assert.equal(res_01.statusCode, 200)
			})
			const result_02 = fn(req_02, res_02).then(() => {
				assert.equal(res_02.statusCode, 200)
			})

			return Promise.all([result_01, result_02])
 		})))

/*eslint-disable */
describe('index', () => 
	describe('#handleEvent: 04', () => 
		it(`Should fail to serve any query if the graphiql is toggled but the path to access it is wrong.`, () => {
			/*eslint-enable */

			const schema = `
			type Product {
				id: ID!
				name: String!
				shortDescription: String
			}

			type Query {
				# ### GET products
				#
				# _Arguments_
				# - **id**: Product's id (optional)
				products(id: Int): [Product]
			}

			schema {
				query: Query
			}
			`
			const productMocks = [{ id: 1, name: 'Product A', shortDescription: 'First product.' }, { id: 2, name: 'Product B', shortDescription: 'Second product.' }]
			const productResolver = {
				Query: {
					products(root, { id }, context) {
						const results = id ? productMocks.filter(p => p.id == id) : productMocks
						if (results)
							return results
						else
							throw graphqlError(404, `Product with id ${id} does not exist.`)
					}
				}
			}

			const executableSchema = makeExecutableSchema({
				typeDefs: schema,
				resolvers: productResolver
			})

			const graphqlOptions = {
				schema: executableSchema,
				graphiql: true,
				endpointURL: "/graphiql"
			}

			const uri = 'users/graphiql'
			const req_01 = httpMocks.createRequest({
				method: 'GET',
				headers: {
					origin: 'http://localhost:8080',
					referer: 'http://localhost:8080',
					accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
				},
				_parsedUrl: {
					pathname: uri
				},
				url: uri,
				body: { 
					query: `
						query {
							products(id: 1) {
								name
							}
						}`,
					variables: null 
				}
			})
			const res_01 = httpMocks.createResponse()

			app.reset()
			app.all(['/', '/graphiql'], graphqlHandler(graphqlOptions), () => null)
			const fn = app.handleEvent()

			const result_01 = fn(req_01, res_01).then(() => {
				assert.equal(res_01.statusCode, 404)
				const html = res_01._getData()
				assert.equal(res_01._getData(), `Endpoint 'users/graphiql' for method GET not found.`)
			})

			return Promise.all([result_01])
		})))

/*eslint-disable */
describe('index', () => 
	describe('#handleEvent: 05', () => 
		it(`Should serve GraphQL queries`, () => {
			/*eslint-enable */

			const schema = `
			type Product {
				id: ID!
				name: String!
				shortDescription: String
			}

			type Query {
				# ### GET products
				#
				# _Arguments_
				# - **id**: Product's id (optional)
				products(id: Int): [Product]
			}

			schema {
				query: Query
			}
			`
			const productMocks = [{ id: 1, name: 'Product A', shortDescription: 'First product.' }, { id: 2, name: 'Product B', shortDescription: 'Second product.' }]
			const productResolver = {
				Query: {
					products(root, { id }, context) {
						const results = id ? productMocks.filter(p => p.id == id) : productMocks
						if (results)
							return results
						else
							throw graphqlError(404, `Product with id ${id} does not exist.`)
					}
				}
			}

			const executableSchema = makeExecutableSchema({
				typeDefs: schema,
				resolvers: productResolver
			})

			const graphqlOptions = {
				schema: executableSchema,
				graphiql: true,
				endpointURL: "/graphiql"
			}

			const uri = 'users/graphiql'
			const req_01 = httpMocks.createRequest({
				method: 'GET',
				headers: {
					origin: 'http://localhost:8080',
					referer: 'http://localhost:8080',
					accept: 'application/json'
				},
				_parsedUrl: {
					pathname: uri
				},
				url: uri,
				body: { 
					query: `
						query {
							products(id: 1) {
								name
							}
						}`,
					variables: null 
				}
			})
			const res_01 = httpMocks.createResponse()

			app.reset()
			app.all(['/users', '/users/graphiql'], graphqlHandler(graphqlOptions), () => null)
			const fn = app.handleEvent()

			const result_01 = fn(req_01, res_01).then(() => {
				assert.equal(res_01.statusCode, 200)
				const html = res_01._getData()
				assert.isOk(html)
				assert.equal(typeof(html), 'string')
				let htmlJson
				try {
					htmlJson = JSON.parse(html)
				}
				catch(err) {
					assert.isOk(err)
					htmlJson = null
				}
				assert.isOk(htmlJson, `Response should be a json object.`)
				assert.isOk(htmlJson.data, `Response should be a json object with a defined 'data' property.`)
				assert.isOk(htmlJson.data.products, `Response should be a json object with a defined 'data.products' property.`)
				assert.isOk(htmlJson.data.products.length > 0, `Response's 'data.products' must be an array with at least one element.`)
				assert.equal(htmlJson.data.products[0].name, 'Product A')
			})

			return Promise.all([result_01])
		})))

/*eslint-disable */
describe('index', () => 
	describe('#handleEvent: 06', () => 
		it(`Should support empty query 'query{}' and return nothing.`, () => {
			/*eslint-enable */

			const schema = `
			type Product {
				id: ID!
				name: String!
				shortDescription: String
			}

			type Query {
				# ### GET products
				#
				# _Arguments_
				# - **id**: Product's id (optional)
				products(id: Int): [Product]
			}

			schema {
				query: Query
			}
			`
			const productMocks = [{ id: 1, name: 'Product A', shortDescription: 'First product.' }, { id: 2, name: 'Product B', shortDescription: 'Second product.' }]
			const productResolver = {
				Query: {
					products(root, { id }, context) {
						const results = id ? productMocks.filter(p => p.id == id) : productMocks
						if (results)
							return results
						else
							throw graphqlError(404, `Product with id ${id} does not exist.`)
					}
				}
			}

			const executableSchema = makeExecutableSchema({
				typeDefs: schema,
				resolvers: productResolver
			})

			const graphqlOptions = {
				schema: executableSchema,
				graphiql: true,
				endpointURL: "/graphiql"
			}

			const uri = 'users/graphiql'
			const req_01 = httpMocks.createRequest({
				method: 'GET',
				headers: {
					origin: 'http://localhost:8080',
					referer: 'http://localhost:8080',
					accept: 'application/json'
				},
				_parsedUrl: {
					pathname: uri
				},
				url: uri,
				body: { 
					query: `query{}`,
					variables: null 
				}
			})
			const res_01 = httpMocks.createResponse()
			const req_02 = httpMocks.createRequest({
				method: 'GET',
				headers: {
					origin: 'http://localhost:8080',
					referer: 'http://localhost:8080',
					accept: 'application/json'
				},
				_parsedUrl: {
					pathname: uri
				},
				url: uri,
				body: { 
					query: `{}`,
					variables: null 
				}
			})
			const res_02 = httpMocks.createResponse()

			app.reset()
			app.all(['/users', '/users/graphiql'], graphqlHandler(graphqlOptions), () => null)
			const fn = app.handleEvent()

			const result_01 = fn(req_01, res_01).then(() => {
				assert.equal(res_01.statusCode, 200)
				const html = res_01._getData()
				assert.isOk(html)
				assert.equal(html, '{}')
			})

			const result_02 = fn(req_02, res_02).then(() => {
				assert.equal(res_02.statusCode, 200)
				const html = res_01._getData()
				assert.isOk(html)
				assert.equal(html, '{}')
			})

			return Promise.all([result_01, result_02])
		})))

/*eslint-disable */
describe('index', () => 
	describe('#handleEvent: 07', () => 
		it(`Should support custom handling of the final response with an 'onResponse' function defined in the graphQl options.`, () => {
			/*eslint-enable */

			const schema = `
			type Product {
				id: ID!
				name: String!
				shortDescription: String
			}

			type Query {
				# ### GET products
				#
				# _Arguments_
				# - **id**: Product's id (optional)
				products(id: Int): [Product]
			}

			schema {
				query: Query
			}
			`
			const productMocks = [{ id: 1, name: 'Product A', shortDescription: 'First product.' }, { id: 2, name: 'Product B', shortDescription: 'Second product.' }]
			const productResolver = {
				Query: {
					products(root, { id }, context) {
						const results = id ? productMocks.filter(p => p.id == id) : productMocks
						if (results)
							return results
						else
							throw graphqlError(404, `Product with id ${id} does not exist.`)
					}
				}
			}

			const executableSchema = makeExecutableSchema({
				typeDefs: schema,
				resolvers: productResolver
			})

			const graphqlOptions = {
				schema: executableSchema,
				graphiql: true,
				endpointURL: "/graphiql",
				onResponse: (req, res, result) => {
					return Object.assign(result, { data: { properties: { id: 1 } }, hello: 'world' })
				}
			}

			const uri = 'users/graphiql'
			const req_01 = httpMocks.createRequest({
				method: 'GET',
				headers: {
					origin: 'http://localhost:8080',
					referer: 'http://localhost:8080',
					accept: 'application/json'
				},
				_parsedUrl: {
					pathname: uri
				},
				url: uri,
				body: { 
					query: `query{}`,
					variables: null 
				}
			})
			const res_01 = httpMocks.createResponse()

			app.reset()
			app.all(['/users', '/users/graphiql'], graphqlHandler(graphqlOptions), () => null)
			const fn = app.handleEvent()

			const result_01 = fn(req_01, res_01).then(() => {
				assert.equal(res_01.statusCode, 200)
				const html = res_01._getData()
				assert.isOk(html)
				assert.equal(html, '{"data":{"properties":{"id":1}},"hello":"world"}')
			})

			return Promise.all([result_01])
		})))

/*eslint-disable */
describe('index', () => 
	describe('#handleEvent: 08', () => 
		it(`Should transform graphql response with a 'request.graphQl.transform' function.`, () => {
			/*eslint-enable */

			const schema = `
			type Product {
				id: ID!
				name: String!
				shortDescription: String
			}

			type Query {
				# ### GET products
				#
				# _Arguments_
				# - **id**: Product's id (optional)
				products(id: Int): [Product]
			}

			schema {
				query: Query
			}
			`
			const productMocks = [{ id: 1, name: 'Product A', shortDescription: 'First product.' }, { id: 2, name: 'Product B', shortDescription: 'Second product.' }]
			const productResolver = {
				Query: {
					products(root, { id }, context) {
						const results = id ? productMocks.filter(p => p.id == id) : productMocks
						if (results)
							return results
						else
							throw graphqlError(404, `Product with id ${id} does not exist.`)
					}
				}
			}

			const executableSchema = makeExecutableSchema({
				typeDefs: schema,
				resolvers: productResolver
			})

			const graphqlOptions = {
				schema: executableSchema,
				graphiql: true,
				endpointURL: "/graphiql"
			}

			const uri = 'users/graphiql'
			const req_01 = httpMocks.createRequest({
				method: 'GET',
				headers: {
					origin: 'http://localhost:8080',
					referer: 'http://localhost:8080',
					accept: 'application/json'
				},
				_parsedUrl: {
					pathname: uri
				},
				url: uri,
				body: { 
					query: `
						query {
							products(id: 1) {
								id
							}
						}`,
					variables: null 
				},
				graphql: {
					transform: result => {
						if (result.data.products[0].id == 1) {
							result.data.products[0].name = 'Hello'
						}
					}
				}
			})
			const res_01 = httpMocks.createResponse()

			app.reset()
			app.all(['/users', '/users/graphiql'], graphqlHandler(graphqlOptions), () => null)
			const fn = app.handleEvent()

			const result_01 = fn(req_01, res_01).then(() => {
				assert.equal(res_01.statusCode, 200)
				const html = res_01._getData()
				assert.isOk(html)
				assert.equal(html, '{"data":{"products":[{"id":"1","name":"Hello"}]}}')
			})

			return Promise.all([result_01])
		})))

/*eslint-disable */
describe('index', () => 
	describe('#handleEvent: 09', () => 
		it(`Should return a properly formatted graphql error if the 'optionsData.onResponse' function fails as well as a http 500.`, () => {
			/*eslint-enable */

			const schema = `
			type Product {
				id: ID!
				name: String!
				shortDescription: String
			}

			type Query {
				# ### GET products
				#
				# _Arguments_
				# - **id**: Product's id (optional)
				products(id: Int): [Product]
			}

			schema {
				query: Query
			}
			`
			const productMocks = [{ id: 1, name: 'Product A', shortDescription: 'First product.' }, { id: 2, name: 'Product B', shortDescription: 'Second product.' }]
			const productResolver = {
				Query: {
					products(root, { id }, context) {
						const results = id ? productMocks.filter(p => p.id == id) : productMocks
						if (results)
							return results
						else
							throw graphqlError(404, `Product with id ${id} does not exist.`)
					}
				}
			}

			const executableSchema = makeExecutableSchema({
				typeDefs: schema,
				resolvers: productResolver
			})

			const graphqlOptions = {
				schema: executableSchema,
				graphiql: true,
				endpointURL: "/graphiql",
				onResponse: (req, res, result) => {
					if (result.data.product[0].id == 1)
						result.data.products[0].name = 'Hello'
				}
			}

			const uri = 'users/graphiql'
			const req_01 = httpMocks.createRequest({
				method: 'GET',
				headers: {
					origin: 'http://localhost:8080',
					referer: 'http://localhost:8080',
					accept: 'application/json'
				},
				_parsedUrl: {
					pathname: uri
				},
				url: uri,
				body: { 
					query: `
						query {
							products(id: 1) {
								id
							}
						}`,
					variables: null 
				}
			})
			const res_01 = httpMocks.createResponse()

			app.reset()
			app.all(['/users', '/users/graphiql'], graphqlHandler(graphqlOptions), () => null)
			const fn = app.handleEvent()

			const result_01 = fn(req_01, res_01).then(() => {
				assert.equal(res_01.statusCode, 500)
				const html = res_01._getData()
				assert.isOk(html)
				const result = JSON.parse(html)
				assert.isOk(result.errors[0].message.indexOf(`TypeError: Cannot read property '0' of undefined`) >= 0)
				assert.equal(result.errors[0].location, `Function 'optionsData.onResponse'`)
			})

			return Promise.all([result_01])
		})))

/*eslint-disable */
describe('index', () => 
	describe('#handleEvent: 10', () => 
		it(`Should return a properly formatted graphql error if the 'request.graphQl.transform' function fails as well as a http 500.`, () => {
			/*eslint-enable */

			const schema = `
			type Product {
				id: ID!
				name: String!
				shortDescription: String
			}

			type Query {
				# ### GET products
				#
				# _Arguments_
				# - **id**: Product's id (optional)
				products(id: Int): [Product]
			}

			schema {
				query: Query
			}
			`
			const productMocks = [{ id: 1, name: 'Product A', shortDescription: 'First product.' }, { id: 2, name: 'Product B', shortDescription: 'Second product.' }]
			const productResolver = {
				Query: {
					products(root, { id }, context) {
						const results = id ? productMocks.filter(p => p.id == id) : productMocks
						if (results)
							return results
						else
							throw graphqlError(404, `Product with id ${id} does not exist.`)
					}
				}
			}

			const executableSchema = makeExecutableSchema({
				typeDefs: schema,
				resolvers: productResolver
			})

			const graphqlOptions = {
				schema: executableSchema,
				graphiql: true,
				endpointURL: "/graphiql"
			}

			const uri = 'users/graphiql'
			const req_01 = httpMocks.createRequest({
				method: 'GET',
				headers: {
					origin: 'http://localhost:8080',
					referer: 'http://localhost:8080',
					accept: 'application/json'
				},
				_parsedUrl: {
					pathname: uri
				},
				url: uri,
				body: { 
					query: `
						query {
							products(id: 1) {
								id
							}
						}`,
					variables: null 
				},
				graphql: {
					transform: result => {
						if (result.data.product[0].id == 1) {
							result.data.products[0].name = 'Hello'
						}
					}
				}
			})
			const res_01 = httpMocks.createResponse()

			app.reset()
			app.all(['/users', '/users/graphiql'], graphqlHandler(graphqlOptions), () => null)
			const fn = app.handleEvent()

			const result_01 = fn(req_01, res_01).then(() => {
				assert.equal(res_01.statusCode, 500)
				const html = res_01._getData()
				assert.isOk(html)
				const result = JSON.parse(html)
				assert.isOk(result.errors[0].message.indexOf(`TypeError: Cannot read property '0' of undefined`) >= 0)
				assert.equal(result.errors[0].location, `Function 'request.graphql.transform'`)
			})

			return Promise.all([result_01])
		})))

/*eslint-disable */
describe('index', () => 
	describe('#graphqlError: 01', () => 
		it(`Should control the HTTP code being sent when some errors happen.`, () => {
			/*eslint-enable */

			const schema = `
			type Product {
				id: ID!
				name: String!
				shortDescription: String
			}

			type Query {
				# ### GET products
				#
				# _Arguments_
				# - **id**: Product's id (optional)
				products(id: Int): [Product]
			}

			schema {
				query: Query
			}
			`
			const productMocks = [{ id: 1, name: 'Product A', shortDescription: 'First product.' }, { id: 2, name: 'Product B', shortDescription: 'Second product.' }]
			const productResolver = {
				Query: {
					products(root, { id }, context) {
						const results = id ? productMocks.filter(p => p.id == id) : productMocks
						if (results.length > 0)
							return results
						else
							throw graphqlError(404, `Product with id ${id} does not exist.`)
					}
				}
			}

			const executableSchema = makeExecutableSchema({
				typeDefs: schema,
				resolvers: productResolver
			})

			const graphqlOptions = {
				schema: executableSchema,
				graphiql: true,
				endpointURL: "/graphiql"
			}

			const uri = 'users/graphiql'
			const req_01 = httpMocks.createRequest({
				method: 'GET',
				headers: {
					origin: 'http://localhost:8080',
					referer: 'http://localhost:8080',
					accept: 'application/json'
				},
				_parsedUrl: {
					pathname: uri
				},
				url: uri,
				body: { 
					query: `
						query {
							products(id: 10) {
								name
							}
						}`,
					variables: null 
				}
			})
			const res_01 = httpMocks.createResponse()

			app.reset()
			app.all(['/users', '/users/graphiql'], graphqlHandler(graphqlOptions), () => null)
			const fn = app.handleEvent()

			const result_01 = fn(req_01, res_01).then(() => {
				assert.equal(res_01.statusCode, 404)
				const html = res_01._getData()
				assert.isOk(html)
				assert.equal(typeof(html), 'string')
				let htmlJson
				try {
					htmlJson = JSON.parse(html)
				}
				catch(err) {
					assert.isOk(err)
					htmlJson = null
				}
				assert.isOk(htmlJson, `Response should be a json object.`)
				assert.isOk(htmlJson.errors, `Response should be a json object with a defined 'errors' property.`)
				assert.isOk(htmlJson.errors.length > 0, `Response's 'errors' must be an array with at least one element.`)
				assert.equal(htmlJson.errors[0].message, 'Product with id 10 does not exist.')
			})

			return Promise.all([result_01])
		})))

/*eslint-disable */
describe('index', () => 
	describe('#graphqlError: 02', () => 
		it(`Should obfuscate the error message in prod.`, () => {
			/*eslint-enable */

			const schema = `
			type Product {
				id: ID!
				name: String!
				shortDescription: String
			}

			type Query {
				# ### GET products
				#
				# _Arguments_
				# - **id**: Product's id (optional)
				products(id: Int): [Product]
			}

			schema {
				query: Query
			}
			`
			const productMocks = [{ id: 1, name: 'Product A', shortDescription: 'First product.' }, { id: 2, name: 'Product B', shortDescription: 'Second product.' }]
			const productResolver = {
				Query: {
					products(root, { id }, context) {
						const results = id ? productMocks.filter(p => p.id == id) : productMocks
						if (results.length > 0)
							return results
						else
							throw graphqlError(404, `Product with id ${id} does not exist.`, { hide: true })
					}
				}
			}

			const executableSchema = makeExecutableSchema({
				typeDefs: schema,
				resolvers: productResolver
			})

			const graphqlOptions = {
				schema: executableSchema,
				graphiql: true,
				endpointURL: "/graphiql"
			}

			const uri = 'users/graphiql'
			const req_01 = httpMocks.createRequest({
				method: 'GET',
				headers: {
					origin: 'http://localhost:8080',
					referer: 'http://localhost:8080',
					accept: 'application/json'
				},
				_parsedUrl: {
					pathname: uri
				},
				url: uri,
				body: { 
					query: `
						query {
							products(id: 10) {
								name
							}
						}`,
					variables: null 
				}
			})
			const res_01 = httpMocks.createResponse()

			app.reset()
			app.all(['/users', '/users/graphiql'], graphqlHandler(graphqlOptions), () => null)
			const fn = app.handleEvent()

			const result_01 = fn(req_01, res_01).then(() => {
				assert.equal(res_01.statusCode, 404)
				const html = res_01._getData()
				assert.isOk(html)
				assert.equal(typeof(html), 'string')
				let htmlJson
				try {
					htmlJson = JSON.parse(html)
				}
				catch(err) {
					assert.isOk(err)
					htmlJson = null
				}
				assert.isOk(htmlJson, `Response should be a json object.`)
				assert.isOk(htmlJson.errors, `Response should be a json object with a defined 'errors' property.`)
				assert.isOk(htmlJson.errors.length > 0, `Response's 'errors' must be an array with at least one element.`)
				assert.equal(htmlJson.errors[0].message, 'Internal Server Error')
			})

			return Promise.all([result_01])
		})))



