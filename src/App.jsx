import { useState, useEffect, useRef } from "react"
import { supabase } from "./supabaseClient"

// ─── Auth Page ─────────────────────────────────────────
function AuthPage({ onLogin }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError(""); setLoading(true)
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onLogin(data.user, data.user.user_metadata.username || email.split("@")[0])
      } else {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { username } }
        })
        if (error) throw error
        if (data.user) onLogin(data.user, username)
      }
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg,#a855f7,#ec4899)", boxShadow: "0 0 32px #a855f760" }}>
            <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">NeonChat</h1>
          <p className="text-purple-300 mt-1 text-sm">Private rooms. Real-time vibes.</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 border border-purple-900"
          style={{ background: "#13132b" }}>
          <div className="flex rounded-xl overflow-hidden mb-6 border border-purple-900">
            <button onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-medium transition-all ${isLogin ? "bg-purple-600 text-white" : "text-purple-400 hover:text-white"}`}>
              Sign In
            </button>
            <button onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-medium transition-all ${!isLogin ? "bg-purple-600 text-white" : "text-purple-400 hover:text-white"}`}>
              Sign Up
            </button>
          </div>

          <div className="space-y-3">
            {!isLogin && (
              <input value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Username" className="input-field"
                style={inputStyle} />
            )}
            <input value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email" type="email" style={inputStyle} />
            <input value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password" type="password" style={inputStyle} />
          </div>

          {error && <p className="text-pink-400 text-xs mt-3">{error}</p>}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full mt-5 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg,#a855f7,#ec4899)", boxShadow: "0 0 20px #a855f740" }}>
            {loading ? "Please wait…" : isLogin ? "Sign In" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  )
}

const inputStyle = {
  width: "100%", padding: "10px 14px", borderRadius: "10px",
  background: "#0d0d1a", border: "1px solid #4c1d95",
  color: "white", fontSize: "14px", outline: "none"
}

// ─── Room Lobby ─────────────────────────────────────────
function RoomLobby({ user, username, onJoinRoom, onLogout }) {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")

  const joinRoom = async () => {
    if (!code.trim()) return
    const roomCode = code.trim().toUpperCase()
    // Upsert room (creates if not exists)
    await supabase.from("rooms").upsert({ code: roomCode }, { onConflict: "code" })
    onJoinRoom(roomCode)
  }

  const createRoom = () => {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    setCode(newCode)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-bold text-white">Hey, {username} 👋</h2>
            <p className="text-purple-400 text-sm">Join or create a room</p>
          </div>
          <button onClick={onLogout}
            className="text-xs text-purple-400 hover:text-pink-400 border border-purple-800 px-3 py-1.5 rounded-lg transition-colors">
            Logout
          </button>
        </div>

        <div className="rounded-2xl p-6 border border-purple-900" style={{ background: "#13132b" }}>
          <input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="Enter room code (e.g. XK72AB)"
            style={{ ...inputStyle, textTransform: "uppercase", letterSpacing: "4px", textAlign: "center", fontSize: "18px" }}
          />
          {error && <p className="text-pink-400 text-xs mt-2">{error}</p>}

          <button onClick={joinRoom}
            className="w-full mt-4 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#a855f7,#ec4899)", boxShadow: "0 0 20px #a855f740" }}>
            Join Room
          </button>

          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-purple-900"/>
            <span className="mx-3 text-purple-600 text-xs">or</span>
            <div className="flex-1 h-px bg-purple-900"/>
          </div>

          <button onClick={createRoom}
            className="w-full py-3 rounded-xl font-semibold text-purple-300 border border-purple-700 hover:border-purple-500 transition-all">
            Generate Room Code
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Chat Room ─────────────────────────────────────────
function ChatRoom({ user, username, roomCode, onLeave }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const bottomRef = useRef(null)

  // Load existing messages
  useEffect(() => {
    supabase.from("messages")
      .select("*").eq("room_code", roomCode).order("created_at")
      .then(({ data }) => setMessages(data || []))
  }, [roomCode])

  // Subscribe to real-time new messages
  useEffect(() => {
    const channel = supabase.channel(`room-${roomCode}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `room_code=eq.${roomCode}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [roomCode])

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return
    const content = input.trim()
    setInput("")
    await supabase.from("messages").insert({
      room_code: roomCode, user_id: user.id,
      username, content
    })
  }

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  // Group consecutive messages by same user
  const grouped = messages.reduce((acc, msg, i) => {
    const prev = messages[i - 1]
    const sameUser = prev && prev.user_id === msg.user_id
    const timeDiff = prev ? new Date(msg.created_at) - new Date(prev.created_at) : Infinity
    acc.push({ ...msg, showHeader: !sameUser || timeDiff > 60000 })
    return acc
  }, [])

  const isMe = (msg) => msg.user_id === user.id

  const avatarColor = (name) => {
    const colors = ["#7c3aed","#db2777","#0891b2","#059669","#d97706"]
    return colors[name.charCodeAt(0) % colors.length]
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: "#0d0d1a" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-purple-900"
        style={{ background: "#13132b" }}>
        <div className="flex items-center gap-3">
          <button onClick={onLeave} className="text-purple-400 hover:text-white transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-sm">Room: {roomCode}</span>
              <span className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: "0 0 6px #4ade80" }}/>
            </div>
            <p className="text-purple-400 text-xs">Live • end-to-end encrypted feel</p>
          </div>
        </div>
        <div className="text-xs text-purple-500 font-mono bg-purple-950 px-2 py-1 rounded-lg">
          {roomCode}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {grouped.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${isMe(msg) ? "flex-row-reverse" : "flex-row"} items-end`}>
            {/* Avatar */}
            {!isMe(msg) && msg.showHeader && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: avatarColor(msg.username), boxShadow: `0 0 8px ${avatarColor(msg.username)}60` }}>
                {msg.username[0].toUpperCase()}
              </div>
            )}
            {!isMe(msg) && !msg.showHeader && <div className="w-7 flex-shrink-0"/>}

            <div className={`max-w-[70%] ${isMe(msg) ? "items-end" : "items-start"} flex flex-col`}>
              {msg.showHeader && (
                <span className={`text-xs text-purple-400 mb-1 ${isMe(msg) ? "text-right" : "text-left"}`}>
                  {isMe(msg) ? "You" : msg.username}
                </span>
              )}
              <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${
                isMe(msg)
                  ? "text-white rounded-br-sm"
                  : "text-white rounded-bl-sm"
              }`}
                style={isMe(msg)
                  ? { background: "linear-gradient(135deg,#7c3aed,#db2777)", boxShadow: "0 0 12px #a855f730" }
                  : { background: "#1e1e3a", border: "1px solid #4c1d9540" }
                }>
                {msg.content}
              </div>
              <span className="text-purple-600 text-xs mt-0.5">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-purple-900" style={{ background: "#13132b" }}>
        <div className="flex gap-2 items-end">
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
            placeholder="Message…" rows={1}
            className="flex-1 resize-none rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all"
            style={{ background: "#0d0d1a", border: "1px solid #4c1d95",
              maxHeight: "120px", lineHeight: "1.5",
              boxShadow: input ? "0 0 10px #a855f730" : "none" }}
          />
          <button onClick={sendMessage} disabled={!input.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:opacity-90 active:scale-95 disabled:opacity-30"
            style={{ background: "linear-gradient(135deg,#a855f7,#ec4899)" }}>
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
              <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Root App ─────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState("")
  const [roomCode, setRoomCode] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user)
        setUsername(session.user.user_metadata.username || session.user.email.split("@")[0])
      }
      setLoading(false)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null); setUsername(""); setRoomCode(null)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"/>
    </div>
  )

  if (!user) return <AuthPage onLogin={(u, name) => { setUser(u); setUsername(name) }} />
  if (!roomCode) return <RoomLobby user={user} username={username} onJoinRoom={setRoomCode} onLogout={handleLogout} />
  return <ChatRoom user={user} username={username} roomCode={roomCode} onLeave={() => setRoomCode(null)} />
}