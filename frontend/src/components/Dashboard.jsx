import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { fetchLogs, downloadCSV } from "../api"

const COLORS = ["#6c63ff", "#ff6b6b", "#43e97b", "#f7971e"]

export default function Dashboard({ token }) {
    const [logs, setLogs]       = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError]     = useState("")

    useEffect(() => {
        fetchLogs(token)
            .then(setLogs)
            .catch(() => setError("Failed to load logs"))
            .finally(() => setLoading(false))

        const interval = setInterval(() => {
            fetchLogs(token).then(setLogs).catch(() => {})
        }, 10000)
        return () => clearInterval(interval)
    }, [token])

    // ── derived stats ──────────────────────────────────────
    const totalQueries  = logs.length
    const piiCount      = logs.filter(l => l.pii_detected).length
    const successCount  = logs.filter(l => l.status === "success").length
    const avgResponse   = logs.length
        ? Math.round(logs.reduce((s, l) => s + l.response_time_ms, 0) / logs.length)
        : 0

    // queries per user for bar chart
    const userCounts = Object.entries(
        logs.reduce((acc, l) => {
            acc[l.user_id] = (acc[l.user_id] || 0) + 1
            return acc
        }, {})
    ).map(([user_id, count]) => ({ user_id, count }))

    // role distribution for pie chart
    const roleCounts = Object.entries(
        logs.reduce((acc, l) => {
            acc[l.role] = (acc[l.role] || 0) + 1
            return acc
        }, {})
    ).map(([name, value]) => ({ name, value }))

    if (loading) return <div style={styles.center}>Loading...</div>
    if (error)   return <div style={styles.center}>{error}</div>

    return (
        <div style={styles.page}>

            {/* header */}
            <div style={styles.header}>
                <h1 style={styles.title}>SentinelProxy Dashboard</h1>
                <button style={styles.exportBtn} onClick={() => downloadCSV(token)}>
                    Export CSV
                </button>
            </div>

            {/* stat cards */}
            <div style={styles.cards}>
                <StatCard label="Total Queries"    value={totalQueries} />
                <StatCard label="PII Detected"     value={piiCount}     color="#ff6b6b" />
                <StatCard label="Successful"        value={successCount} color="#43e97b" />
                <StatCard label="Avg Response (ms)" value={avgResponse}  color="#f7971e" />
            </div>

            {/* charts row */}
            <div style={styles.charts}>

                {/* queries per user bar chart */}
                <div style={styles.chartBox}>
                    <h3 style={styles.chartTitle}>Queries per User</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={userCounts}>
                            <XAxis dataKey="user_id" stroke="#666" />
                            <YAxis stroke="#666" />
                            <Tooltip
                                contentStyle={{ background:"#1a1d27", border:"1px solid #2a2d3a" }}
                            />
                            <Bar dataKey="count" fill="#6c63ff" radius={[4,4,0,0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* role distribution pie chart */}
                <div style={styles.chartBox}>
                    <h3 style={styles.chartTitle}>Role Distribution</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={roleCounts} dataKey="value" nameKey="name"
                                 cx="50%" cy="50%" outerRadius={80} label>
                                {roleCounts.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ background:"#1a1d27", border:"1px solid #2a2d3a" }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* live query feed */}
            <div style={styles.feedBox}>
                <h3 style={styles.chartTitle}>Live Query Feed</h3>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            {["Time","User","Role","Model","PII","Status","ms"].map(h => (
                                <th key={h} style={styles.th}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {logs.slice(0, 20).map(log => (
                            <tr key={log.id}>
                                <td style={styles.td}>{new Date(log.timestamp).toLocaleTimeString()}</td>
                                <td style={styles.td}>{log.user_id}</td>
                                <td style={styles.td}>{log.role}</td>
                                <td style={styles.td}>{log.model}</td>
                                <td style={styles.td}>
                                    <span style={log.pii_detected ? styles.badgeRed : styles.badgeGreen}>
                                        {log.pii_detected ? "yes" : "no"}
                                    </span>
                                </td>
                                <td style={styles.td}>{log.status}</td>
                                <td style={styles.td}>{log.response_time_ms}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function StatCard({ label, value, color = "#6c63ff" }) {
    return (
        <div style={styles.card}>
            <div style={{ ...styles.cardValue, color }}>{value}</div>
            <div style={styles.cardLabel}>{label}</div>
        </div>
    )
}

const styles = {
    page:       { background:"#0f1117", minHeight:"100vh", padding:"24px", color:"#fff", fontFamily:"sans-serif" },
    center:     { display:"flex", justifyContent:"center", alignItems:"center", height:"100vh", color:"#fff", background:"#0f1117" },
    header:     { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" },
    title:      { margin:0, fontSize:"22px", fontWeight:700 },
    exportBtn:  { padding:"8px 16px", borderRadius:"8px", background:"#6c63ff", color:"#fff", border:"none", cursor:"pointer", fontWeight:600 },
    cards:      { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"16px", marginBottom:"24px" },
    card:       { background:"#1a1d27", padding:"20px", borderRadius:"12px" },
    cardValue:  { fontSize:"32px", fontWeight:700, marginBottom:"4px" },
    cardLabel:  { fontSize:"12px", color:"#666" },
    charts:     { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", marginBottom:"24px" },
    chartBox:   { background:"#1a1d27", padding:"20px", borderRadius:"12px" },
    chartTitle: { margin:"0 0 16px", fontSize:"14px", fontWeight:600, color:"#aaa" },
    feedBox:    { background:"#1a1d27", padding:"20px", borderRadius:"12px" },
    table:      { width:"100%", borderCollapse:"collapse" },
    th:         { textAlign:"left", padding:"8px 12px", fontSize:"12px", color:"#666", borderBottom:"1px solid #2a2d3a" },
    td:         { padding:"8px 12px", fontSize:"13px", borderBottom:"1px solid #1a1d27", color:"#ccc" },
    badgeRed:   { background:"#ff6b6b22", color:"#ff6b6b", padding:"2px 8px", borderRadius:"10px", fontSize:"11px" },
    badgeGreen: { background:"#43e97b22", color:"#43e97b", padding:"2px 8px", borderRadius:"10px", fontSize:"11px" },
}