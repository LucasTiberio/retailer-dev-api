const fs = require('fs');
const resolvers = require('./resolvers.js');
const { gql } = require('apollo-server');
const schema = fs.readFileSync(`${__dirname}/schema.gql`,  'utf8');

module.exports = {
	typeDefs: gql`${schema}`,
	resolvers 
}