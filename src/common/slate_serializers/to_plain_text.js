import { Node } from 'slate'

export const serialize = (nodes) => {
  return nodes.map((n) => Node.string(n)).join('\n')
}
