import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useSubscription } from './useSubscription'
import { saveSettingsSection, subscribeSettings, validateSettings } from '../../lib/firestore/settings'
import { errorMessage } from '../../lib/firestore/shared'

/**
 * Editable copy of siteSettings/{section}.
 * The subscription loads once; local edits win until the next explicit save.
 */
export function useSettingsForm() {
  const { user } = useAuth()
  const { items, loading, error } = useSubscription(
    (cb) => subscribeSettings((res) => cb({ items: res.settings, error: res.error })),
  )
  const [form, setForm] = useState(null)
  const [savingSection, setSavingSection] = useState('')
  const [feedback, setFeedback] = useState(null)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (items && !loadedRef.current) {
      loadedRef.current = true
      setForm(items)
    }
  }, [items])

  const setSectionValue = (section, key, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: { ...(prev?.[section] || {}), [key]: value },
    }))
    setFeedback(null)
  }

  const replaceSection = (section, next) => {
    setForm((prev) => ({ ...prev, [section]: next }))
    setFeedback(null)
  }

  const saveSection = async (section) => {
    if (!form?.[section]) return false
    const found = validateSettings(section, form[section])
    if (Object.keys(found).length) {
      setFeedback({ tone: 'error', section, text: 'Fix the highlighted fields before saving.' })
      return false
    }
    setSavingSection(section)
    try {
      await saveSettingsSection(section, form[section], user?.uid)
      setFeedback({ tone: 'ok', section, text: 'Saved.' })
      return true
    } catch (err) {
      setFeedback({ tone: 'error', section, text: errorMessage(err) })
      return false
    } finally {
      setSavingSection('')
      setTimeout(() => setFeedback(null), 3000)
    }
  }

  return {
    loading: loading && !form,
    error,
    form,
    setSectionValue,
    replaceSection,
    saveSection,
    savingSection,
    feedback,
  }
}

export default useSettingsForm
