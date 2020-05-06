import service from '../service';
import { IResolvers } from 'apollo-server';

const resolvers : IResolvers = {
  Query: {
    hellob8: (obj, args, context) => {
      return service.hellob8();
    },
  },
};

export default resolvers;
