export const slugRegex = (value: string) => {
  return value.match(/^[a-z0-9-]+$/gi)
}
