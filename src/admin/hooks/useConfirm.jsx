import { useCallback, useRef, useState } from 'react'
import ConfirmDialog from '../components/ConfirmDialog'

/**
 * Promise-based confirmation:
 *   const [confirmNode, askConfirm] = useConfirm()
 *   if (await askConfirm({ title: 'Delete property?', danger: true })) { … }
 * Render {confirmNode} once inside the page.
 */
export function useConfirm() {
  const [request, setRequest] = useState(null)
  const resolverRef = useRef(null)

  const askConfirm = useCallback((options) => new Promise((resolve) => {
    resolverRef.current = resolve
    setRequest(options)
  }), [])

  const settle = useCallback((result) => {
    resolverRef.current?.(result)
    resolverRef.current = null
    setRequest(null)
  }, [])

  const node = request
    ? (
      <ConfirmDialog
        {...request}
        onConfirm={() => settle(true)}
        onCancel={() => settle(false)}
      />
    )
    : null

  return [node, askConfirm]
}

export default useConfirm
