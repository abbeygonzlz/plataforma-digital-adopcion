import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ─── Auth (simulado sobre /api/users) ────────────────────
// El backend no tiene endpoints de auth, se usan los de Users
export const authService = {
  // Login: busca por email y verifica contraseña contra el campo
  // que ahora devuelve el backend en UserDto.
  login: async ({ email, password }) => {
    const res = await api.get("/users");
    const users = Array.isArray(res.data) ? res.data : [];
    const found = users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );
    if (!found) throw new Error("No existe una cuenta con ese correo");
    if (found.password !== password)
      throw new Error("Contraseña incorrecta. Intenta de nuevo.");
    return { ...found, id: found.idUser };
  },

  // Register: verifica email único y crea usuario
  register: async ({
    fullName,
    email,
    password,
    userType,
    phone,
    region,
    profileDescription,
  }) => {
    const res = await api.get("/users");
    const users = Array.isArray(res.data) ? res.data : [];
    const exists = users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );
    if (exists) throw new Error("Ya existe una cuenta con ese correo");
    const payload = {
      fullName,
      email,
      password,
      userType: userType || "adopter",
      phone: phone || "",
      region: region || "",
      profileDescription: profileDescription || "",
      profileImage: "",
    };
    const created = await api.post("/users", payload);
    const userData = created.data;
    return { ...userData, id: userData.idUser };
  },
};

// ─── Users ───────────────────────────────────────────────
// POST   { fullName, email, password, phone, region, userType, profileDescription, profileImage }
// PUT    { fullName, phone, region, profileDescription, profileImage, status }
export const userService = {
  getAll: () => api.get("/users"),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post("/users", data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// ─── Pets ────────────────────────────────────────────────
// POST   { idUser, name, petType, breed, age, gender, size, vaccinated, sterilized, description, region }
// PUT    { name, breed, age, gender, size, vaccinated, sterilized, description, region, publicationStatus }
export const petService = {
  getAll: (params) => api.get("/pets", { params }),
  getById: (id) => api.get(`/pets/${id}`),
  create: (data) => api.post("/pets", data),
  update: (id, data) => api.put(`/pets/${id}`, data),
  delete: (id) => api.delete(`/pets/${id}`),
};

// ─── Pet Photos ──────────────────────────────────────────
// POST   { idPet, photoUrl, isMain }
export const petPhotoService = {
  getByPet: (petId) => api.get(`/pet-photos/by-pet/${petId}`),
  create: (data) => api.post("/pet-photos", data),
  delete: (id) => api.delete(`/pet-photos/${id}`),
};

// ─── Adoption Requests ───────────────────────────────────
// POST   { idPet, idUser, address, housingType, petExperience, hasOtherPets, contactPhone, adoptionReason }
// PATCH  { requestStatus }
export const adoptionService = {
  getById: (id) => api.get(`/adoption-requests/${id}`),
  getByPet: (petId) => api.get(`/adoption-requests/by-pet/${petId}`),
  getByUser: (userId) => api.get(`/adoption-requests/by-user/${userId}`),
  create: (data) => api.post("/adoption-requests", data),
  updateStatus: (id, requestStatus) =>
    api.patch(`/adoption-requests/${id}/status`, { requestStatus }),
  delete: (id) => api.delete(`/adoption-requests/${id}`),
};

// ─── Marketplace Items ───────────────────────────────────
// POST   { idUser, title, category, description, itemCondition, price, region, mainPhoto }
// PUT    { title, category, description, itemCondition, price, region, mainPhoto, publicationStatus }
export const marketplaceService = {
  getAll: () => api.get("/marketplace-items"),
  getById: (id) => api.get(`/marketplace-items/${id}`),
  create: (data) => api.post("/marketplace-items", data),
  update: (id, data) => api.put(`/marketplace-items/${id}`, data),
  delete: (id) => api.delete(`/marketplace-items/${id}`),
};

// ─── Consultations ───────────────────────────────────────
// POST   { senderIdUser, receiverIdUser, subject, message }
// PATCH  { consultationStatus }
export const consultationService = {
  getById: (id) => api.get(`/consultations/${id}`),
  getBySender: (userId) => api.get(`/consultations/by-sender/${userId}`),
  getByReceiver: (userId) => api.get(`/consultations/by-receiver/${userId}`),
  create: (data) => api.post("/consultations", data),
  updateStatus: (id, consultationStatus) =>
    api.patch(`/consultations/${id}/status`, { consultationStatus }),
};

// ─── Consultation Responses ──────────────────────────────
// POST   { idConsultation, idUser, responseMessage }
export const consultationResponseService = {
  getByConsultation: (id) =>
    api.get(`/consultation-responses/by-consultation/${id}`),
  create: (data) => api.post("/consultation-responses", data),
};

export default api;

// ─── Shelters (simulado: son usuarios con userType === 'shelter') ─────────────
export const shelterService = {
  // Trae todos los usuarios y filtra los que son refugio
  getAll: async () => {
    const res = await api.get("/users");
    const shelters = (Array.isArray(res.data) ? res.data : []).filter(
      (u) => u.userType === "shelter" || u.userType === "Shelter",
    );
    return { data: shelters };
  },

  // Trae un refugio por id (es un usuario)
  getById: async (id) => {
    const res = await api.get(`/users/${id}`);
    return res;
  },

  // Trae las mascotas de un refugio específico (idUser = id del refugio)
  getPetsByShelterId: async (shelterId) => {
    const res = await api.get("/pets");
    const pets = (Array.isArray(res.data) ? res.data : []).filter(
      (p) => p.idUser === parseInt(shelterId),
    );
    return { data: pets };
  },

  // Para el dashboard: trae las mascotas del usuario logueado
  getMyPets: async () => {
    const stored = localStorage.getItem("adopaws_user");
    const user = stored ? JSON.parse(stored) : null;
    if (!user?.id) return { data: [] };
    const res = await api.get("/pets");
    const pets = (Array.isArray(res.data) ? res.data : []).filter(
      (p) => p.idUser === user.id,
    );
    return { data: pets };
  },
};
