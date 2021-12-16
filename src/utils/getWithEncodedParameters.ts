export default <T>(parameters: T) => {
  const keys = Object.keys(parameters)
  const encoded = keys.map(key => `${key}=${encodeURIComponent((parameters as any)[key])}`).join('&')

  return encoded
}