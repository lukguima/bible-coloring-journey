"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const errorMessages: Record<string, string> = {
  CredentialsSignin: "Email ou senha incorretos.",
  unauthorized: "Você não tem permissão para acessar essa página.",
  default: "Ocorreu um erro. Tente novamente.",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const e = searchParams.get("error");
    if (e) setError(errorMessages[e] ?? errorMessages.default);
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError(errorMessages.CredentialsSignin);
      return;
    }
    const callbackUrl = searchParams.get("callbackUrl");
    router.push(callbackUrl ?? "/coloring");
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
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>📖</div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "28px",
              fontWeight: 700,
              color: "#263B5E",
              margin: "0 0 8px",
            }}
          >
            Bible Coloring Journey
          </h1>
          <p
            style={{
              fontFamily: "'Nunito', system-ui, sans-serif",
              fontSize: "14px",
              color: "#6B7280",
              margin: 0,
            }}
          >
            Entre na sua conta para acessar o conteúdo
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

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
              style={{
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
              }}
              onFocus={(e) => (e.target.style.borderColor = "#263B5E")}
              onBlur={(e) => (e.target.style.borderColor = "#D1D5DB")}
            />
          </div>

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
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
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
              }}
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
              backgroundColor: loading ? "#9AA5B4" : "#C76F4A",
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
            {loading ? "Entrando..." : "Entrar"}
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
          Não tem uma conta?{" "}
          <Link
            href="/register"
            style={{ color: "#C76F4A", fontWeight: 700, textDecoration: "none" }}
          >
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
