-- Fijar search_path en funciones auxiliares y ocultar club_setting de la API pública
ALTER FUNCTION club_now() SET search_path = public;
ALTER FUNCTION normalize_py_phone(TEXT) SET search_path = public;
ALTER FUNCTION trg_booking_schedule() SET search_path = public;
ALTER FUNCTION py_ruc_is_valid(TEXT) SET search_path = public;
REVOKE EXECUTE ON FUNCTION club_setting(TEXT, NUMERIC) FROM PUBLIC, anon, authenticated;
