export function handleError(error) {
    const status = error?.status;
    if (status === 401)
        throw new Error('UNAUTHORIZED: token inválido');
    if (status === 403)
        throw new Error('FORBIDDEN: sin permisos');
    if (status === 404)
        throw new Error('NOT_FOUND: recurso no existe');
    if (status === 422)
        throw new Error('VALIDATION_ERROR: datos inválidos');
    throw new Error(`UNKNOWN_ERROR: ${error?.message}`);
}
//# sourceMappingURL=errors.js.map