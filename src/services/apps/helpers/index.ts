export const parseAppName = (name: string): string | undefined => {
  const names = {
    'Plug Form': 'Formulários'
  } as {[key: string]: string}

  return names[name]
}