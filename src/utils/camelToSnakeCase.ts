const camelToSnakeCase = (values: any) => {
  let obj: any = {}
  Object.keys(values).map((item) => {
    const labelSnakeCased = item.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    obj = { ...obj, [labelSnakeCased]: values[item] }
  })
  return obj
}

export default camelToSnakeCase
