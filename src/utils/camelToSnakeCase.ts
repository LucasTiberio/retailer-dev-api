const camelToSnakeCase = (values: any) => {
  return Object.keys(values).map((item) => {
    const labelSnakeCased = item.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    return { [labelSnakeCased]: values[item] }
  })[0]
}

export default camelToSnakeCase
