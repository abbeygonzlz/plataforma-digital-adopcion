import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/api";
import Button from "../components/ui/Button";
import styles from "./Auth.module.css";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const defaultRole = searchParams.get("role") || "adopter";

  const [form, setForm] = useState({
    fullName: "", // backend: fullName
    email: "",
    password: "",
    confirmPassword: "",
    userType: defaultRole, // backend: userType (adopter | shelter)
    phone: "",
    region: "", // backend: region (no city)
    profileDescription: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password) {
      setError("Por favor completa todos los campos requeridos.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      const userData = await authService.register(payload);
      login(userData);
      navigate("/");
    } catch (err) {
      setError(err.message || "Error al crear la cuenta. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.visual}>
        <div className={styles.visualContent}>
          <div className={styles.visualLogo}>
            <span className={styles.visualPaw}>🐾</span>
            <span className={styles.visualBrand}>Adopaws</span>
          </div>
          <h2 className={styles.visualTitle}>
            Únete a miles de familias que ya encontraron a su compañero ideal
          </h2>
          <div className={styles.pawPattern}>🐾</div>
        </div>
      </div>

      <div className={styles.formSide}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>Crear cuenta</h1>
            <p className={styles.formSub}>
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className={styles.formLink}>
                Inicia sesión
              </Link>
            </p>
          </div>

          {/* Selector de tipo de usuario */}
          <div className={styles.roleSelector}>
            <button
              type="button"
              className={`${styles.roleBtn} ${form.userType === "adopter" ? styles.roleBtnActive : ""}`}
              onClick={() =>
                setForm((prev) => ({ ...prev, userType: "adopter" }))
              }
            >
              <span>🏠</span>
              <div>
                <strong>Adoptante</strong>
                <span>Quiero adoptar una mascota</span>
              </div>
            </button>
            <button
              type="button"
              className={`${styles.roleBtn} ${form.userType === "shelter" ? styles.roleBtnActive : ""}`}
              onClick={() =>
                setForm((prev) => ({ ...prev, userType: "shelter" }))
              }
            >
              <span>🏥</span>
              <div>
                <strong>Refugio</strong>
                <span>Gestiono un refugio de animales</span>
              </div>
            </button>
          </div>

          {error && (
            <div className={styles.errorAlert}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="fullName" className={styles.label}>
                {form.userType === "shelter"
                  ? "Nombre del refugio"
                  : "Nombre completo"}{" "}
                *
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className={styles.input}
                placeholder="Tu nombre"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                Correo electrónico *
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={styles.input}
                placeholder="tu@correo.com"
                required
              />
            </div>

            <div className={styles.twoCol}>
              <div className={styles.field}>
                <label htmlFor="phone" className={styles.label}>
                  Teléfono
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="+56 9 xxxx xxxx"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="region" className={styles.label}>
                  Región
                </label>
                <input
                  id="region"
                  type="text"
                  name="region"
                  value={form.region}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Tu región"
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="profileDescription" className={styles.label}>
                Descripción (opcional)
              </label>
              <input
                id="profileDescription"
                type="text"
                name="profileDescription"
                value={form.profileDescription}
                onChange={handleChange}
                className={styles.input}
                placeholder="Cuéntanos sobre ti"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>
                Contraseña *
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className={styles.input}
                placeholder="Mínimo 8 caracteres"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirmar contraseña *
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className={styles.input}
                placeholder="Repite la contraseña"
                required
              />
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Crear cuenta
            </Button>

            <p className={styles.terms}>
              Al registrarte aceptas nuestros{" "}
              <Link to="/terms" className={styles.formLink}>
                Términos de uso
              </Link>{" "}
              y{" "}
              <Link to="/privacy" className={styles.formLink}>
                Política de privacidad
              </Link>
              .
            </p>
          </form>

          <div className={styles.backHome}>
            <Link to="/" className={styles.backLink}>
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
