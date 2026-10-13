import { STARTING_BALANCE } from '../data/assets.js'

const USERS_KEY = 'sv_users'
const SESSION_KEY = 'sv_current_user'
const PREFS_KEY = 'sv_prefs'

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable (private mode / quota) — app keeps working in memory */
  }
}

async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function newUser({ name, email, salt, passwordHash }) {
  return {
    name,
    email,
    salt,
    passwordHash,
    balance: STARTING_BALANCE,
    holdings: [],
    transactions: [],
    watchlist: ['RELIANCE', 'TCS', 'HDFCBANK'],
    alerts: [],
    createdAt: Date.now(),
  }
}

/**
 * Tiny reactive store over localStorage. Passwords are salted + SHA-256 hashed
 * via Web Crypto — still a demo, not real security, since everything lives
 * client side.
 */
class Store {
  constructor() {
    this.listeners = new Set()
    this.users = read(USERS_KEY, {})
    this.email = read(SESSION_KEY, null)
    this.prefs = read(PREFS_KEY, { theme: 'system' })
    if (this.email && !this.users[this.email]) this.email = null
  }

  get user() {
    return this.email ? this.users[this.email] : null
  }

  subscribe(fn) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  emit() {
    for (const fn of this.listeners) fn(this)
  }

  persist() {
    write(USERS_KEY, this.users)
    write(SESSION_KEY, this.email)
    write(PREFS_KEY, this.prefs)
  }

  update(fn) {
    if (!this.user) return
    this.users[this.email] = fn(this.user)
    this.persist()
    this.emit()
  }

  setPref(key, value) {
    this.prefs = { ...this.prefs, [key]: value }
    this.persist()
    this.emit()
  }

  async register({ name, email, password }) {
    email = email.trim().toLowerCase()
    if (!name.trim()) throw new Error('Please enter your name')
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Please enter a valid email')
    if (password.length < 6) throw new Error('Password must be at least 6 characters')
    if (this.users[email]) throw new Error('An account with this email already exists')
    const salt = crypto.randomUUID()
    this.users[email] = newUser({ name: name.trim(), email, salt, passwordHash: await hashPassword(password, salt) })
    this.email = email
    this.persist()
    this.emit()
  }

  async login({ email, password }) {
    email = email.trim().toLowerCase()
    const u = this.users[email]
    if (!u || u.passwordHash !== (await hashPassword(password, u.salt))) {
      throw new Error('Invalid email or password')
    }
    this.email = email
    this.persist()
    this.emit()
  }

  async loginDemo(seedPortfolio) {
    const email = 'demo@stockvault.app'
    if (!this.users[email]) {
      const salt = crypto.randomUUID()
      const user = newUser({ name: 'Demo Investor', email, salt, passwordHash: await hashPassword('demo1234', salt) })
      this.users[email] = seedPortfolio(user)
    }
    this.email = email
    this.persist()
    this.emit()
  }

  logout() {
    this.email = null
    this.persist()
    this.emit()
  }

  resetAccount() {
    this.update((u) => ({ ...u, balance: STARTING_BALANCE, holdings: [], transactions: [], alerts: [] }))
  }
}

export const store = new Store()
