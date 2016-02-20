var validator = require('is-my-json-valid')

// the normal JSON schema way that is most familiar:

var pantsSchema = {
	type: 'object',
	properties: {
		pants: {
			$ref: '#size'
		}
	},
	required: [ 'pants' ]
}

var sizeSchema = {
	type: 'object',
	properties: {
		size: {
			type: 'number'
		}
	},
	required: [ 'size' ]
}

var validate = validator(pantsSchema, { schemas: { size: sizeSchema } })

console.log('true:', validate({ pants: { size: 40 } }))
console.log('false:', validate({ pants: { size: 'big' } }))
console.log('false:', validate({ pants: {} }))

// using SDMP URIs as references instead

var pantsSchema = {
	type: 'object',
	properties: {
		pants: {
			$ref: 'sdmp://abc123/abc123'
		}
	},
	required: [ 'pants' ]
}

var sizeSchema = {
	type: 'object',
	properties: {
		size: {
			type: 'number'
		}
	},
	required: [ 'size' ]
}

var validate = validator(pantsSchema, { schemas: { 'sdmp://abc123/abc123': sizeSchema } })

console.log('true:', validate({ pants: { size: 40 } }))
console.log('false:', validate({ pants: { size: 'big' } }))
console.log('false:', validate({ pants: {} }))
