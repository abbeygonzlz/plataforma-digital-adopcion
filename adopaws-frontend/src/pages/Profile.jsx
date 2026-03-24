import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/api";
import Button from "../components/ui/Button";
import styles from "./ProfilePage.module.css";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    region: user?.region || "",
    profileDescription: user?.profileDescription || "",
    profileImage: user?.profileImage || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      // PUT /api/users/{id} acepta: fullName, phone, region, profileDescription, profileImage, status
      await userService.update(user.id, form);
      updateUser(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Error al guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { name: "fullName", label: "Nombre completo", type: "text" },
    { name: "phone", label: "Teléfono", type: "tel" },
    { name: "region", label: "Región", type: "text" },
    { name: "profileDescription", label: "Descripción", type: "text" },
    { name: "profileImage", label: "URL de foto de perfil", type: "text" },
  ];

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>Mi perfil</h1>
        <div className={styles.card}>
          <div className={styles.avatar}>
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.fullName}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
            ) : (
              (user?.fullName?.[0]?.toUpperCase() ?? "U")
            )}
          </div>
          <p
            style={{
              textAlign: "center",
              color: "#666",
              marginBottom: "0.5rem",
            }}
          >
            {user?.email} · <strong>{user?.userType}</strong>
          </p>

          {error && (
            <p style={{ color: "red", textAlign: "center" }}>{error}</p>
          )}

          <form className={styles.form} onSubmit={handleSubmit}>
            {fields.map(({ name, label, type }) => (
              <div key={name} className={styles.field}>
                <label className={styles.label}>{label}</label>
                <input
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  className={styles.input}
                  type={type}
                />
              </div>
            ))}
            <Button type="submit" loading={saving}>
              {saved ? "✓ Guardado" : "Guardar cambios"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
