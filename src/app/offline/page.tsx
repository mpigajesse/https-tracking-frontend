"use client";

export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#111111",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "24px",
        padding: "32px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background: "#1C1C1C",
          border: "2px solid #CC0000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 40,
          fontWeight: 900,
          color: "#CC0000",
        }}
      >
        L
      </div>

      <h1
        style={{
          color: "#F5F5F5",
          fontSize: 24,
          fontWeight: 700,
          margin: 0,
          textAlign: "center",
        }}
      >
        Lear Corporation
      </h1>

      <p
        style={{
          color: "#888888",
          fontSize: 14,
          margin: 0,
          textAlign: "center",
          maxWidth: 280,
          lineHeight: 1.6,
        }}
      >
        Vous êtes hors ligne. Vérifiez votre connexion internet et réessayez.
      </p>

      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: 8,
          padding: "12px 32px",
          background: "#CC0000",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Réessayer
      </button>
    </div>
  );
}
