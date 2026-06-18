"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() || undefined, email: email.toLowerCase(), password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erro ao criar conta. Tente novamente.");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirect: false,
    });

    setLoading(false);
    if (result?.error) {
      router.push("/login");
      return;
    }
    router.push("/coloring");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F8F1E7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          padding: "48px 40px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 4px 24px rgba(38,59,94,0.10)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>✨</div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "28px",
              fontWeight: 700,
              color: "#263B5E",
              margin: "0 0 8px",
            }}
          >
            Criar Conta
          </h1>
          <p
            style={{
              fontFamily: "'Nunito', system-ui, sans-serif",
              fontSize: "14px",
              color: "#6B7280",
              margin: 0,
            }}
          >
            Junte-se ao Bible Coloring Journey
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "20px",
              fontFamily: "'Nunito', system-ui, sans-serif",
              fontSize: "14px",
              color: "#DC2626",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label
              style={{
                display: "block",
                fontFamily: "'Nunito', system-ui, sans-serif",
                fontSize: "13px",
                fontWeight: 700,
                color: "#263B5E",
                marginBottom: "6px",
              }}
            >
              Nome <span style={{ fontWeight: 400, color: "#9CA3AF" }}>(opcional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#263B5E")}
              onBlur={(e) => (e.target.style.borderColor = "#D1D5DB")}
            />
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#263B5E")}
              onBlur={(e) => (e.target.style.borderColor = "#D1D5DB")}
            />
          </div>

          <div>
            <label style={labelStyle}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Mínimo 8 caracteres"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#263B5E")}
              onBlur={(e) => (e.target.style.borderColor = "#D1D5DB")}
            />
          </div>

          <div>
            <label style={labelStyle}>Confirmar Senha</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              placeholder="Repita a senha"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#263B5E")}
              onBlur={(e) => (e.target.style.borderColor = "#D1D5DB")}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "8px",
              width: "100%",
              padding: "13px",
              backgroundColor: loading ? "#9AA5B4" : "#263B5E",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "10px",
              fontFamily: "'Nunito', system-ui, sans-serif",
              fontSize: "16px",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color 0.15s",
            }}
          >
            {loading ? "Criando conta..." : "Criar Conta"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "24px",
            fontFamily: "'Nunito', system-ui, sans-serif",
            fontSize: "14px",
            color: "#6B7280",
          }}
        >
          Já tem uma conta?{" "}
          <Link href="/login" style={{ color: "#C76F4A", fontWeight: 700, textDecoration: "none" }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "'Nunito', system-ui, sans-serif",
  fontSize: "13px",
  fontWeight: 700,
  color: "#263B5E",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1.5px solid #D1D5DB",
  borderRadius: "10px",
  fontFamily: "'Nunito', system-ui, sans-serif",
  fontSize: "15px",
  color: "#263B5E",
  backgroundColor: "#FAFAFA",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};
