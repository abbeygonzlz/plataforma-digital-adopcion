import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adoptionService, petService } from "../services/api";
import styles from "./SimpleList.module.css";

const STATUS_MAP = {
  pending: { label: "Pendiente", color: "#D4A017" },
  approved: { label: "Aprobada", color: "#4A7C59" },
  rejected: { label: "Rechazada", color: "#C0392B" },
  completed: { label: "Completada", color: "#2E86AB" },
};

export default function MyApplications() {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    // GET /api/adoption-requests/by-user/{userId}
    adoptionService
      .getByUser(user.id)
      .then(async (r) => {
        const requests = Array.isArray(r.data) ? r.data : [];
        // Enriquecer con datos de la mascota
        const enriched = await Promise.all(
          requests.map(async (req) => {
            try {
              const petRes = await petService.getById(req.idPet);
              return { ...req, pet: petRes.data };
            } catch {
              return {
                ...req,
                pet: { id: req.idPet, name: "Mascota", petType: "" },
              };
            }
          }),
        );
        setApps(enriched);
      })
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>Mis solicitudes</h1>
        {loading ? (
          <p style={{ color: "var(--color-text-muted)" }}>Cargando...</p>
        ) : apps.length === 0 ? (
          <div className={styles.empty}>
            <span>📋</span>
            <p>No tienes solicitudes de adopción aún.</p>
            <Link to="/pets" className={styles.link}>
              Explorar mascotas
            </Link>
          </div>
        ) : (
          <div className={styles.list}>
            {apps.map((app) => {
              const statusKey = app.requestStatus?.toLowerCase() || "pending";
              const s = STATUS_MAP[statusKey] || {
                label: app.requestStatus || "Pendiente",
                color: "#888",
              };
              return (
                <div key={app.id} className={styles.item}>
                  <div className={styles.itemInfo}>
                    <strong>{app.pet?.name || "Mascota"}</strong>
                    <span>{app.pet?.petType || app.pet?.breed || ""}</span>
                  </div>
                  <div className={styles.itemDate}>
                    {app.createdAt
                      ? new Date(app.createdAt).toLocaleDateString("es")
                      : "—"}
                  </div>
                  <div
                    className={styles.badge}
                    style={{ background: s.color + "20", color: s.color }}
                  >
                    {s.label}
                  </div>
                  <Link to={`/pets/${app.idPet}`} className={styles.link}>
                    Ver mascota →
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
