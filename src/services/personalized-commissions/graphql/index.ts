import fs from 'fs';
import resolvers from './resolvers';
import { gql } from 'apollo-server';

const schema = fs.readFileSync(`${__dirname}/schema.gql`,  'utf8');

export default {
	typeDefs: gql`${schema}`,
	resolvers 
}