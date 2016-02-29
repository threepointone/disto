
export default function parser(config) {
  return {
    read(env, query, remote = false) {
      return query.reduce((o, field) =>
        (o[field.node] = config.read(env, field.node, field), o), {})
    },
    mutate(env, action) {
      return config.mutate(env, action)
    }
  }
}
