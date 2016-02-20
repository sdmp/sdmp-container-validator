# sdmp-container-validator

Validate a JSON object as an SDMP container.

## install

Install the normal [npm](https://www.npmjs.com/) way:

	npm install sdmp-container-validator

## use it

Use it like this:

	var container = {
		sdmp: {
			version: '0.13',
			schemas: [ 'message' ]
		},
		message: 'Hello world!'
	}
	var validator = require('sdmp-container-validator')
	var result = validator(container)
	// assert result.isValid is true

If your container references a schema other than the
[core schemas](http://sdmp.io/spec/0.12/core/container/),
you'll need to include them as a key/value map:

	var container = {
		sdmp: {
			version: '0.13',
			schemas: [ 'sdmp://GlvAreTo...' ]
		},
		hello: 'world'
	}
	var schemas = {
		'sdmp://GlvAreTo...': { /* a valid JSON schema object */ }
	}
	var validator = require('sdmp-container-validator')
	var result = validator(container, schemas)
	// assert result.isValid is true

In particular, this module does not handle external schema
references, so if your schema references another schema, you
will need to include it in the map. (See [the tests](./test/test.js)
for more details.)

## api: `validator(jsonObject[, schemaMap])`

###### `jsonObject` *(`object`, required)*

This is the SDMP container to be validated.

###### `schemaMap` *(`object`, optional)*

If the container to be validated contains references
to a non-core schema, that schema will be accessed
by this object. The map `key` is the URI referenced,
while the `value` is the JSON schema.

###### return: *(object)*

The returned object has the following possible properties:

* `isValid` *boolean*: The container is valid, all schemas
	have been resolved and validated.
* `schema` *string*: If a schema fails validation, this will
	be the schema URI which failed.
* `schemaNotFound` *boolean*: A schema URI was not found in
	the `schemaMap` object.

## license

Published and released under the [Very Open License](http://veryopenlicense.com/).

<3
