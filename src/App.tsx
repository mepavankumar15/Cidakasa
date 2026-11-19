import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import PalaceList from './MyPalaces'   // was: import MyPalaces from './MyPalaces'

function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isNew, setIsNew] = useState(true)
  const [error, setError] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const creds = { email, password }
    const { error } = isNew
      ? await supabase.auth.signUp(creds)
      : await supabase.auth.signInWithPassword(creds)
    if (error) setError(error.message)
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 12, maxWidth: 340, margin: '48px auto' }}>
      <h1>{isNew ? 'Create your account' : 'Log in'}</h1>
      <label>Email
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </label>
      <label>Password
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required />
      </label>
      {error && <p role="alert">{error}</p>}
      <button type="submit">{isNew ? 'Create account' : 'Log in'}</button>
      <button type="button" onClick={() => setIsNew(!isNew)}>
        {isNew ? 'I already have an account' : 'I need an account'}
      </button>
    </form>
  )
}

function MyPalaces({ email }: { email: string }) {
  return (
    <main style={{ maxWidth: 340, margin: '48px auto' }}>
      <PalaceList />
      <button onClick={() => supabase.auth.signOut()}>Log out</button>
    </main>
  )
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  if (loading) return <p>Loading…</p>
  return session ? <MyPalaces email={session.user.email ?? ''} /> : <AuthForm />
}