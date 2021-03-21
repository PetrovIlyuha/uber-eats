module.exports = {
  client: {
    includes: ["./src/**/*.tsx"],
    tagName: 'gql',
    service: {
      name: "grabs-eaters-backend",
      url: "http://localhost:4000/graphql"
    }
  }
}
