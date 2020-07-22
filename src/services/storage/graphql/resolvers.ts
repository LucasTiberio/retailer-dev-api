import { IResolvers } from "apollo-server";

const resolvers : IResolvers = {
  // Mutation: {
  //   uploadImage: async (_, input) => {
  //     const { createReadStream, filename, mimetype } = await input.file;
  //     const uploadedImage = await service.uploadImage(filename, createReadStream(), mimetype);
  //     return uploadedImage;
  //   }
  // }
};

module.exports = resolvers;
