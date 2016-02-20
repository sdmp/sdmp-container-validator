var test = require('tape')
var validator = require('../')

test('invalid containers do not pass', function(t) {
	var container = { someField: 'not the one that is needed' }
	var result = validator(container)
	t.notOk(result.isValid, 'container is not valid')
	t.equals(result.schema, 'container', 'return failed schema')
	t.end()
})

test('requires 0.13 exactly', function(t) {
	var container = {
		sdmp: {
			version: '0.11',
			schemas: []
		}
	}
	var result = validator(container)
	t.notOk(result.isValid, 'container is not valid')
	t.equals(result.schema, 'container', 'return failed schema')
	t.end()
})

test('schemas must be present', function(t) {
	var container = {
		sdmp: {
			version: '0.13'
		}
	}
	var result = validator(container)
	t.notOk(result.isValid, 'container is not valid')
	t.equals(result.schema, 'container', 'return failed schema')
	t.end()
})

test('each schema in list must be present in container', function(t) {
	var container = {
		sdmp: {
			version: '0.13',
			schemas: [ 'message' ]
		}
	}
	var result = validator(container)
	t.notOk(result.isValid, 'container is not valid')
	t.equals(result.schema, 'container', 'return failed schema')
	t.end()
})

test('each schema in container must be present in list', function(t) {
	var container = {
		sdmp: {
			version: '0.13',
			schemas: []
		},
		message: 'hello world'
	}
	var result = validator(container)
	t.notOk(result.isValid, 'container is not valid')
	t.equals(result.schema, 'container', 'return failed schema')
	t.end()
})

test('core schemas do not require a lookup', function(t) {
	var container = {
		sdmp: {
			version: '0.13',
			schemas: [ 'message' ]
		},
		message: 'hello world!'
	}
	var result = validator(container)
	t.ok(result.isValid, 'container is valid')
	t.end()
})

test('schema map failure is an overall failure', function(t) {
	var container = {
		sdmp: {
			version: '0.13',
			schemas: [ 'sdmp://external/link' ]
		},
		'sdmp://external/link': 'externally defined'
	}
	var schemas = {}
	var result = validator(container, schemas)
	t.notOk(result.isValid, 'container is not valid')
	t.ok(result.schemaNotFound, 'failed to find schema')
	t.end()
})

test('schema map references should resolve correctly', function(t) {
	var container = {
		sdmp: {
			version: '0.13',
			schemas: [ 'sdmp://external/link' ]
		},
		'sdmp://external/link': { hello: 'world' }
	}
	var schemas = {
		'sdmp://external/link': {
			type: 'object',
			properties: {
				hello: { type: 'string' }
			},
			required: [ 'hello' ]
		}
	}
	var result = validator(container, schemas)
	t.ok(result.isValid, 'container is valid')
	t.end()
})

test('deeper schema map references should resolve correctly', function(t) {
	var container = {
		sdmp: {
			version: '0.13',
			schemas: [ 'sdmp://external/link' ]
		},
		'sdmp://external/link': {
			pants: {
				size: 40
			}
		}
	}
	var schemas = {
		'sdmp://external/link': {
			type: 'object',
			properties: {
				pants: {
					$ref: 'sdmp://other/schema'
				}
			},
			required: [ 'pants' ]
		},
		'sdmp://other/schema': {
			type: 'object',
			properties: {
				size: { type: 'number' }
			},
			required: [ 'size' ]
		}
	}
	var result1 = validator(container, schemas)
	t.ok(result1.isValid, 'container is valid')

	container['sdmp://external/link'].pants.size = 'big'
	var result2 = validator(container, schemas)
	t.notOk(result2.isValid, 'container is no longer valid')

	t.end()
})
