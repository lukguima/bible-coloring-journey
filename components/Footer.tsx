import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#263B5E",
        color: "#A9C8D8",
        padding: "48px 16px 32px",
        marginTop: "auto",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "32px",
            marginBottom: "40px",
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "22px",
                fontWeight: 700,
                color: "#FFFFFF",
                marginBottom: "8px",
              }}
            >
              Bible Coloring Journey
            </div>
            <p
              style={{
                fontSize: "13px",
                lineHeight: 1.6,
                color: "#A9C8D8",
                fontFamily: "'Nunito', system-ui, sans-serif",
                maxWidth: "240px",
              }}
            >
              Faith-filled printable activities for Christian families, homeschool, and Sunday school.
            </p>
          </div>

          {/* Explore */}
          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#D8B76A",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "12px",
                fontFamily: "'Nunito', system-ui, sans-serif",
              }}
            >
              Explore
            </div>
            {[
              { href: "/stories", label: "Bible Stories" },
              { href: "/coloring", label: "Coloring Studio" },
              { href: "/games", label: "Bible Games" },
              { href: "/printables", label: "Printables" },
              { href: "/progress", label: "My Progress" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: "block",
                  fontSize: "13px",
                  color: "#A9C8D8",
                  textDecoration: "none",
                  marginBottom: "6px",
                  fontFamily: "'Nunito', system-ui, sans-serif",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Resources */}
          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#D8B76A",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "12px",
                fontFamily: "'Nunito', system-ui, sans-serif",
              }}
            >
              Resources
            </div>
            {[
              { href: "/guide", label: "Parent & Teacher Guide" },
              { href: "/free-adventure", label: "Free Adventure" },
              { href: "/unlock", label: "Get Full Pack" },
              { href: "/waitlist", label: "Coming Soon" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: "block",
                  fontSize: "13px",
                  color: "#A9C8D8",
                  textDecoration: "none",
                  marginBottom: "6px",
                  fontFamily: "'Nunito', system-ui, sans-serif",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Legal */}
          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#D8B76A",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "12px",
                fontFamily: "'Nunito', system-ui, sans-serif",
              }}
            >
              Legal
            </div>
            {[
              { href: "/about", label: "About" },
              { href: "/contact", label: "Contact" },
              { href: "/privacy", label: "Privacy Policy" },
              { href: "/terms", label: "Terms of Use" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: "block",
                  fontSize: "13px",
                  color: "#A9C8D8",
                  textDecoration: "none",
                  marginBottom: "6px",
                  fontFamily: "'Nunito', system-ui, sans-serif",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid #FFFFFF18",
            paddingTop: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              color: "#A9C8D8",
              fontFamily: "'Nunito', system-ui, sans-serif",
            }}
          >
            © {new Date().getFullYear()} Bible Coloring Journey. All rights reserved.
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "#A9C8D888",
              fontFamily: "'Nunito', system-ui, sans-serif",
            }}
          >
            Made with ❤️ for Christian families worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
