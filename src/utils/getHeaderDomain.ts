export default (origin: string): string => {
  const HEADER_HOST = (origin || '').split('//')[1].split(':')[0]
  return HEADER_HOST
}
