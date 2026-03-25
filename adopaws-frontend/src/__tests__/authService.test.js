import { describe, it, expect, beforeEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import api, { authService } from "../services/api";

const mock = new MockAdapter(api);

beforeEach(() => {
  mock.reset();
});

describe("authService", () => {
  // ─── login ────────────────────────────────────────────
  describe("login", () => {
    it("debe retornar el usuario si el email y contraseña son correctos", async () => {
      const usuarios = [
        { idUser: 1, fullName: "Juan", email: "juan@test.com", password: "1234" },
      ];
      mock.onGet("/users").reply(200, usuarios);

      const res = await authService.login({ email: "juan@test.com", password: "1234" });
      expect(res.id).toBe(1);
      expect(res.email).toBe("juan@test.com");
    });

    it("debe lanzar error si el email no existe", async () => {
      mock.onGet("/users").reply(200, []);

      await expect(
        authService.login({ email: "noexiste@test.com", password: "1234" })
      ).rejects.toThrow("No existe una cuenta con ese correo");
    });

    it("debe lanzar error si la contraseña es incorrecta", async () => {
      const usuarios = [
        { idUser: 1, fullName: "Juan", email: "juan@test.com", password: "1234" },
      ];
      mock.onGet("/users").reply(200, usuarios);

      await expect(
        authService.login({ email: "juan@test.com", password: "wrongpassword" })
      ).rejects.toThrow("Contraseña incorrecta. Intenta de nuevo.");
    });

    it("debe ser insensible a mayúsculas en el email", async () => {
      const usuarios = [{ idUser: 1, fullName: "Juan", email: "juan@test.com", password: "1234" }];
      mock.onGet("/users").reply(200, usuarios);

      const res = await authService.login({ email: "JUAN@TEST.COM", password: "1234" });
      expect(res.id).toBe(1);
    });
  });

  // ─── register ─────────────────────────────────────────
  describe("register", () => {
    it("debe registrar un usuario nuevo correctamente", async () => {
      mock.onGet("/users").reply(200, []);
      const nuevo = {
        fullName: "Carlos",
        email: "carlos@test.com",
        password: "1234",
        userType: "adopter",
        phone: "88881111",
        region: "San José",
        profileDescription: "",
      };
      const respuesta = { idUser: 3, ...nuevo, profileImage: "" };
      mock.onPost("/users").reply(201, respuesta);

      const res = await authService.register(nuevo);
      expect(res.id).toBe(3);
      expect(res.email).toBe("carlos@test.com");
    });

    it("debe lanzar error si el email ya existe", async () => {
      const usuarios = [{ idUser: 1, email: "carlos@test.com" }];
      mock.onGet("/users").reply(200, usuarios);

      await expect(
        authService.register({ email: "carlos@test.com" })
      ).rejects.toThrow("Ya existe una cuenta con ese correo");
    });

    it("debe usar valores por defecto si no se pasan campos opcionales", async () => {
      mock.onGet("/users").reply(200, []);
      mock.onPost("/users").reply(201, { idUser: 4, email: "nuevo@test.com" });

      const res = await authService.register({
        fullName: "Nuevo",
        email: "nuevo@test.com",
        password: "1234",
      });
      expect(res.id).toBe(4);
    });
  });
});