const BASE = "http://localhost:8000"

export async function login(username, password) {
    const response = await fetch (`${BASE}/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username, password})
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error("Invalid Credentials " )
    }
    return response.json()
}

export async function fetchLogs(token) {
    const res = await fetch(`${BASE}/export?fmt=json`, {
        headers: { "Authorization": `Bearer ${token}` }
    })
    if (!res.ok) throw new Error("Failed to fetch logs")
    return res.json()  
}

export async function downloadCSV(token){
    const res = await fetch(`${BASE}/export?fmt=csv`, {
        headers: { "Authorization": `Bearer ${token}` }

    })
    if (!res.ok) throw new Error("Failed to download CSV")
    const text = await res.text()

    const blob = new Blob([text], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "sentinel_audit.csv"
    a.click()
    URL.revokeObjectURL(url)
}