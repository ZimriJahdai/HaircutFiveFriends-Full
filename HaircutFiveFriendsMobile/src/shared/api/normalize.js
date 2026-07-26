// HaircutFiveFriends no es consistente en cómo envuelve sus respuestas
// ({data} en la mayoría, {haircut}/{sales}/{sale} en algunos módulos) ni en
// el nombre del id (`Product` expone `id`, el resto expone `_id` crudo).
// Estos dos helpers centralizan esa normalización para que ningún hook la
// reimplemente por su cuenta.

// Extrae el payload de una respuesta axios probando, en orden, las claves
// dadas y cayendo por último a `.data`. Cada call-site pasa explícitamente
// la(s) clave(s) que ese endpoint concreto usa (ver comentarios en cada hook).
export const unwrap = (res, ...keys) => {
  const body = res?.data;
  for (const key of keys) {
    if (body?.[key] !== undefined) return body[key];
  }
  return body?.data;
};

// `Product.toJSON` renombra `_id` -> `id`; el resto de modelos exponen `_id` crudo.
export const getId = (entity) => entity?.id ?? entity?._id ?? null;
