var Promise = require('promise')
var validator = require('is-my-json-valid')
var coreSchemas = require('./schemas.json') // TODO move to module that already exists

function containerIsValid(container) {
	var validate = validator(coreSchemas.container)
	var coreIsValid = validate(container)

	if (coreIsValid) {
		var schemasAreAllInContainer = container.sdmp.schemas.filter(function(uri) {
			return container[uri]
		}).length === container.sdmp.schemas.length

		var containerKeys = Object.keys(container)
		var containerPropertiesAreAllSchemas = containerKeys.filter(function(uri) {
			return container.sdmp.schemas.indexOf(uri) >= 0
		}).length === (containerKeys.length - 1)

		coreIsValid = coreIsValid && schemasAreAllInContainer && containerPropertiesAreAllSchemas
	}

	return coreIsValid
}

function mapContainsSchemas(container, schemaMap) {
	return container.sdmp.schemas.filter(function removeCoreSchemas(uri) {
		return !coreSchemas[uri]
	}).filter(function removeSchemasInMap(uri) {
		return !schemaMap[uri]
	}).length === 0
}

module.exports = function(container, schemaMap) {
	var result = {
		isValid: false
	}

	if (!containerIsValid(container)) {
		result.schema = 'container'
	} else if (!mapContainsSchemas(container, schemaMap)) {
		result.schemaNotFound = true
	} else {
		var validatedCoreSchemas = container.sdmp.schemas.filter(function(uri) {
			return coreSchemas[uri]
		}).map(function(uri) {
			var validate = validator(coreSchemas[uri])
			return {
				schema: uri,
				isValid: validate(container[uri])
			}
		})

		var externalSchemas = container.sdmp.schemas.filter(function(uri) {
			return !coreSchemas[uri]
		})

		var validatedExternalSchemas = externalSchemas.map(function(uri) {
			var validate = validator(schemaMap[uri], { schemas: schemaMap })
			return {
				schema: uri,
				isValid: validate(container[uri])
			}
		})

		var allValidatedSchemas = validatedCoreSchemas.concat(validatedExternalSchemas)

		var invalidObjects = allValidatedSchemas.filter(function(schema) {
			return !schema.isValid
		})

		return (invalidObjects.length > 0 ? invalidObjects[0] : { isValid: true })
	}

	return result
}
