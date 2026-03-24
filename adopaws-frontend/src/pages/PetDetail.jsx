import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { petService, adoptionService, petPhotoService } from "../services/api";
import Button from "../components/ui/Button";
import styles from "./PetDetail.module.css";

const typeEmoji = {
  dog: "🐕",
  perro: "🐕",
  cat: "🐈",
  gato: "🐈",
  rabbit: "🐇",
  conejo: "🐇",
  bird: "🐦",
  ave: "🐦",
};
const genderLabel = {
  male: "Macho",
  female: "Hembra",
  macho: "Macho",
  hembra: "Hembra",
};
const sizeLabel = {
  small: "Pequeño",
  medium: "Mediano",
  large: "Grande",
  pequeño: "Pequeño",
  mediano: "Mediano",
  grande: "Grande",
};

const FORM_EMPTY = {
  address: "",
  housingType: "",
  petExperience: "",
  hasOtherPets: false,
  contactPhone: "",
  adoptionReason: "",
};

export default function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [pet, setPet] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(FORM_EMPTY);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      petService.getById(id),
      petPhotoService.getByPet(id).catch(() => ({ data: [] })),
    ])
      .then(([petRes, photosRes]) => {
        setPet(petRes.data);
        setPhotos(Array.isArray(photosRes.data) ? photosRes.data : []);
      })
      .catch(() => setPet(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAdopt = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/pets/${id}` } } });
      return;
    }
    setApplying(true);
    try {
      // POST /api/adoption-requests { idPet, idUser, address, housingType, petExperience, hasOtherPets, contactPhone, adoptionReason }
      await adoptionService.create({
        idPet: parseInt(id),
        idUser: user.id,
        ...form,
      });
      setApplied(true);
      setShowForm(false);
    } catch (err) {
      alert(err.response?.data?.message || "Error al enviar solicitud");
    } finally {
      setApplying(false);
    }
  };

  if (loading)
    return (
      <div className={styles.loading}>
        <div className={styles.loadingPaw}>🐾</div>
      </div>
    );
  if (!pet)
    return (
      <div className={styles.notFound}>
        <h2>Mascota no encontrada</h2>
        <Link to="/pets">
          <Button>Ver otras mascotas</Button>
        </Link>
      </div>
    );

  const typeKey = pet.petType?.toLowerCase() || "";
  const emoji = typeEmoji[typeKey] || "🐾";
  const bgMap = {
    dog: "linear-gradient(135deg,#F5EDD8,#E8C49A)",
    perro: "linear-gradient(135deg,#F5EDD8,#E8C49A)",
    cat: "linear-gradient(135deg,#EDF5F0,#A8D5B5)",
    gato: "linear-gradient(135deg,#EDF5F0,#A8D5B5)",
  };
  const bg = bgMap[typeKey] || "linear-gradient(135deg,#F0EAE0,#D4C4B0)";
  const allImages = photos.map((p) => p.photoUrl).filter(Boolean);

  return (
    <div className={styles.page}>
      <div className="container">
        <nav className={styles.breadcrumb}>
          <Link to="/">Inicio</Link>
          <span>›</span>
          <Link to="/pets">Mascotas</Link>
          <span>›</span>
          <span>{pet.name}</span>
        </nav>

        <div className={styles.layout}>
          {/* Galería */}
          <div className={styles.gallery}>
            <div className={styles.mainImage} style={{ background: bg }}>
              {allImages.length > 0 ? (
                <img src={allImages[activeImg]} alt={pet.name} />
              ) : (
                <span className={styles.mainEmoji}>{emoji}</span>
              )}
              {(!pet.publicationStatus ||
                pet.publicationStatus === "available") && (
                <div className={styles.statusBadge}>✓ Disponible</div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className={styles.thumbnails}>
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ""}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={img} alt={`${pet.name} ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className={styles.info}>
            <div className={styles.infoHeader}>
              <h1 className={styles.petName}>{pet.name}</h1>
              <p className={styles.petBreed}>
                {pet.breed || "Raza mixta"} · {pet.petType}
              </p>
            </div>

            <div className={styles.chips}>
              {[
                {
                  icon: "🎂",
                  label:
                    pet.age != null
                      ? `${pet.age} ${pet.age === 1 ? "año" : "años"}`
                      : "Edad desconocida",
                },
                {
                  icon: "⚖️",
                  label:
                    sizeLabel[pet.size?.toLowerCase()] || pet.size || "N/D",
                },
                {
                  icon:
                    pet.gender?.toLowerCase() === "male" ||
                    pet.gender?.toLowerCase() === "macho"
                      ? "♂"
                      : "♀",
                  label:
                    genderLabel[pet.gender?.toLowerCase()] ||
                    pet.gender ||
                    "N/D",
                },
                pet.region && { icon: "📍", label: pet.region },
              ]
                .filter(Boolean)
                .map((chip) => (
                  <div key={chip.label} className={styles.chip}>
                    <span>{chip.icon}</span>
                    <span>{chip.label}</span>
                  </div>
                ))}
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Estado de salud</h3>
              <div className={styles.healthGrid}>
                {[
                  { label: "Vacunado", ok: pet.vaccinated },
                  { label: "Esterilizado", ok: pet.sterilized },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`${styles.healthItem} ${item.ok ? styles.healthOk : styles.healthNo}`}
                  >
                    <span>{item.ok ? "✓" : "✗"}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {pet.description && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Sobre {pet.name}</h3>
                <p className={styles.description}>{pet.description}</p>
              </div>
            )}

            {/* CTA */}
            <div className={styles.cta}>
              {applied ? (
                <div className={styles.appliedBanner}>
                  <span>🎉</span>
                  <div>
                    <strong>¡Solicitud enviada!</strong>
                    <p>
                      El refugio revisará tu solicitud y te contactará pronto.
                    </p>
                  </div>
                </div>
              ) : showForm ? (
                <form
                  onSubmit={handleAdopt}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.25rem",
                      color: "var(--color-bark)",
                    }}
                  >
                    Solicitud de adopción
                  </h3>
                  {[
                    {
                      name: "address",
                      label: "Dirección",
                      placeholder: "Tu dirección",
                    },
                    {
                      name: "housingType",
                      label: "Tipo de vivienda",
                      placeholder: "Casa, Apartamento...",
                    },
                    {
                      name: "petExperience",
                      label: "Experiencia con mascotas",
                      placeholder: "¿Has tenido mascotas antes?",
                    },
                    {
                      name: "contactPhone",
                      label: "Teléfono de contacto",
                      placeholder: "+56 9 xxxx xxxx",
                    },
                    {
                      name: "adoptionReason",
                      label: "¿Por qué quieres adoptar?",
                      placeholder: "Cuéntanos...",
                    },
                  ].map((f) => (
                    <div key={f.name}>
                      <label
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 500,
                          color: "var(--color-text-secondary)",
                          display: "block",
                          marginBottom: "3px",
                        }}
                      >
                        {f.label}
                      </label>
                      <input
                        name={f.name}
                        value={form[f.name]}
                        onChange={handleChange}
                        placeholder={f.placeholder}
                        style={{
                          width: "100%",
                          padding: "0.5rem 0.75rem",
                          border: "1.5px solid var(--color-border)",
                          borderRadius: "8px",
                          fontSize: "0.9rem",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  ))}
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.9rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      name="hasOtherPets"
                      checked={form.hasOtherPets}
                      onChange={handleChange}
                    />
                    Tengo otras mascotas en casa
                  </label>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <Button type="submit" loading={applying}>
                      Enviar solicitud
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowForm(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <Button
                  size="xl"
                  fullWidth
                  onClick={() =>
                    isAuthenticated
                      ? setShowForm(true)
                      : navigate("/login", {
                          state: { from: { pathname: `/pets/${id}` } },
                        })
                  }
                >
                  🐾{" "}
                  {isAuthenticated
                    ? "Solicitar adopción"
                    : "Inicia sesión para adoptar"}
                </Button>
              )}
              {!showForm && !applied && (
                <Link to="/pets">
                  <Button variant="ghost" size="md" fullWidth>
                    ← Ver más mascotas
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
