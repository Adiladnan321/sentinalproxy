import { useState } from "react"
import { login } from "../api"

export default function Login({ onLogin }) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError]       = useState("")

    async function handleSubmit() {
        try {
            const data = await login(username, password)
            onLogin(data.access_token)
        } catch {
            setError("Invalid username or password")
        }
    }

    return (
        <div style={styles.wrap}>
            <div style={styles.card}>
                <h2 style={styles.title}>SentinelProxy</h2>
                <p style={styles.sub}>Admin login required</p>
                <input
                    style={styles.input}
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
                <input
                    style={styles.input}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                />
                {error && <p style={styles.error}>{error}</p>}
                <button style={styles.btn} onClick={handleSubmit}>
                    Login
                </button>
            </div>
        </div>
    )
}

const styles = {
    wrap:  { display:"flex", justifyContent:"center", alignItems:"center", height:"100vh", background:"#0f1117" },
    card:  { background:"#1a1d27", padding:"2rem", borderRadius:"12px", width:"320px", display:"flex", flexDirection:"column", gap:"12px" },
    title: { margin:0, color:"#fff", fontSize:"20px", fontWeight:700 },
    sub:   { margin:0, color:"#666", fontSize:"13px" },
    input: { padding:"10px 12px", borderRadius:"8px", border:"1px solid #2a2d3a", background:"#0f1117", color:"#fff", fontSize:"14px" },
    btn:   { padding:"10px", borderRadius:"8px", background:"#6c63ff", color:"#fff", border:"none", cursor:"pointer", fontWeight:600 },
    error: { margin:0, color:"#ff6b6b", fontSize:"12px" },
}