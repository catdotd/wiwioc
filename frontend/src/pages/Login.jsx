// frontend/src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";

export default function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await login(username, password);

            // If backend succeeds, navigate normally
            navigate("/");
        } catch (err) {
            console.warn("Login stub fallback:", err.message);

            // TEMPORARY: allow navigation even while backend not ready yet
            // To be replaced with:
            // setError("Invalid credentials");

            navigate("/");

            // IMPORTANT: Later, remove the above line and use:
            // setError("Invalid credentials");

        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Login</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                />

                {error && (
                    <div className="text-sm text-red-600">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
                >
                    {loading ? "Signing in..." : "Continue"}
                </button>
            </form>
        </div>
    );
}