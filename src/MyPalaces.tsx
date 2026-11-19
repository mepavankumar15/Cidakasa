import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from './supabase'

type Palace = { id: string; name: string; created_at: string }

export default function PalaceList() {
  const [palaces, setPalaces] = useState<Palace[]>([])
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    const { data, error } = await supabase
      .from('palaces')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setPalaces(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function create(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    const { error } = await supabase.from('palaces').insert({ name: trimmed })
    if (error) { setError(error.message); return }
    setName('')
    setError('')
    load()
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this palace and everything in it?')) return
    const { error } = await supabase.from('palaces').delete().eq('id', id)
    if (error) setError(error.message)
    else load()
  }

  return (
    <div>
      <h1>My palaces</h1>
      <form onSubmit={create}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name your first palace, e.g. Cell biology"
          maxLength={60}
        />
        <button type="submit">Create palace</button>
      </form>
      {error && <p role="alert">{error}</p>}
      {loading ? <p>Loading…</p> : palaces.length === 0 ? (
        <p>No palaces yet. Create one above.</p>
      ) : (
        <ul>
          {palaces.map((p) => (
            <li key={p.id}>
              {p.name} <button onClick={() => remove(p.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}