import { Usuario } from "../../domain/Usuario.js";

describe("Dominio: Usuario", () => {
  const datosValidos = { nombre: "Lucía", apellido: "Gómez", email: "Lucia@Mail.com ", contrasenia: "secreta1" };

  describe("registrar", () => {
    it("error si falta el nombre o el apellido", () => {
      expect(() => Usuario.registrar({ ...datosValidos, nombre: "" })).toThrow("El usuario debe tener un nombre");
      expect(() => Usuario.registrar({ ...datosValidos, apellido: "" })).toThrow("El usuario debe tener un apellido");
    });

    it("error si el email no tiene formato válido", () => {
      expect(() => Usuario.registrar({ ...datosValidos, email: "lucia.mail.com" })).toThrow(
        "El email no tiene un formato válido",
      );
    });

    it("error si la contraseña es demasiado corta", () => {
      expect(() => Usuario.registrar({ ...datosValidos, contrasenia: "123" })).toThrow(
        "La contraseña debe tener al menos 6 caracteres",
      );
    });

    it("guarda el email normalizado y la contraseña hasheada, nunca en texto plano", () => {
      const usuario = Usuario.registrar(datosValidos);

      expect(usuario.email).toBe("lucia@mail.com");
      expect(usuario.hashContrasenia).not.toContain("secreta1");
      expect(usuario.verificarContrasenia("secreta1")).toBe(true);
      expect(usuario.verificarContrasenia("otra")).toBe(false);
    });
  });

  describe("favoritos", () => {
    const evento = { id: 7 };

    it("agrega un evento a favoritos una sola vez", () => {
      const usuario = Usuario.registrar(datosValidos);

      usuario.agregarFavorito(evento);
      usuario.agregarFavorito(evento);

      expect(usuario.favoritos).toHaveLength(1);
      expect(usuario.esFavorito(evento)).toBe(true);
    });

    it("quita un evento de favoritos", () => {
      const usuario = Usuario.registrar(datosValidos);
      usuario.agregarFavorito(evento);

      usuario.quitarFavorito(evento);

      expect(usuario.esFavorito(evento)).toBe(false);
    });
  });

  it("toJSON no expone la contraseña y muestra los favoritos como ids", () => {
    const usuario = Usuario.registrar(datosValidos);
    usuario.id = 3;
    usuario.agregarFavorito({ id: 7 });

    const json = usuario.toJSON();

    expect(json).toEqual({ id: 3, nombre: "Lucía", apellido: "Gómez", email: "lucia@mail.com", favoritos: [7] });
  });
});
