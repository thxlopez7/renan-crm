-- Textos visibles en español claro, sin anglicismos ni jerga técnica.
-- Se mantienen los nombres de marcas (Stella Artois, Bullpadel, Gatorade, etc.).

UPDATE courts SET name = 'Cancha 1 (Panorámica)', code = 'CANCHA 1',
    specs = 'Vidrio panorámico · Césped sintético negro · Iluminación para jugar de noche' WHERE id = 'court-1';
UPDATE courts SET name = 'Cancha 2 (Techada con aire)', code = 'CANCHA 2',
    specs = 'Cerrada y climatizada a 21 °C · Iluminación pareja' WHERE id = 'court-2';
UPDATE courts SET name = 'Cancha 3 (Techada al aire libre)', code = 'CANCHA 3',
    specs = 'Con techo y laterales abiertos · Césped sintético azul' WHERE id = 'court-3';

UPDATE gym_plans SET name = 'Plan Completo', period = 'Mensual, horario libre', badge = 'MÁS ELEGIDO',
    description = 'Acceso a toda la sala de musculación, máquinas de última generación y vestuarios.',
    features = ARRAY[
        'Mañana y tarde (07:00 a 12:00 y 14:00 a 21:00)',
        'Sábados de 08:00 a 13:00',
        'Evaluación física inicial y rutina personalizada',
        'Casilleros y toallas',
        '1 turno de cancha gratis por mes'
    ] WHERE id = 'plan-black-pass';
UPDATE gym_plans SET name = 'Plan Mañana', period = 'Mensual, turno mañana', badge = 'MAÑANA',
    description = 'Para entrenar temprano y arrancar el día con energía.',
    features = ARRAY[
        'Lunes a viernes de 07:00 a 12:00',
        'Sábados de 08:00 a 13:00',
        'Control de tu progreso cada mes',
        'Duchas y vestuarios'
    ] WHERE id = 'plan-morning';
UPDATE gym_plans SET name = 'Preparación Física para Pádel', period = 'Mensual, con preparador', badge = 'PARA PÁDEL',
    description = 'Entrenamiento pensado para los movimientos del pádel: velocidad, giros y saltos.',
    features = ARRAY[
        '3 sesiones por semana con preparador físico',
        'Prevención de lesiones de hombro y codo',
        'Más potencia de salto y desplazamiento lateral',
        'Zona de estiramiento y recuperación'
    ] WHERE id = 'plan-padel-fit';

UPDATE coaches SET role = 'Director de la Academia',
    credentials = 'Ex jugador profesional · Entrenador nacional nivel 3',
    bio = 'Técnica de golpes, cómo atacar en la red y cómo tomar decisiones en los puntos importantes.' WHERE id = 'coach-1';
UPDATE coaches SET role = 'Entrenador de competición',
    credentials = 'Entrenador certificado · Preparación para torneos',
    bio = 'Entrena parejas de primera y segunda categoría. Juego de pared y bandeja.' WHERE id = 'coach-2';
UPDATE coaches SET role = 'Profesor de iniciación y clínicas',
    credentials = 'Profesor nacional de pádel',
    bio = 'Para quienes empiezan o quieren mejorar: técnica básica, regularidad desde el fondo y globos.' WHERE id = 'coach-3';

UPDATE menu_items SET category = 'Comidas y picadas' WHERE category = 'Comida & Picadas';
UPDATE menu_items SET category = 'Cervezas y chopp' WHERE category = 'Cervezas & Chopp';
UPDATE menu_items SET category = 'Bebidas' WHERE category = 'Hidratación & Bebidas';
UPDATE menu_items SET category = 'Tienda y alquiler' WHERE category = 'Pro-Shop & Merch';

UPDATE menu_items SET description = 'Tiras de lomito a la plancha, chorizo parrillero casero, mandioca frita y salsa criolla.', tag = 'El clásico del tercer tiempo' WHERE id = 'menu-1';
UPDATE menu_items SET name = 'Hamburguesa Black Angus', description = 'Carne de 180 g, queso cheddar, panceta crocante y papas rústicas.', tag = 'La favorita' WHERE id = 'menu-2';
UPDATE menu_items SET description = 'Lomito tierno, jamón, queso, huevo frito, lechuga y tomate en pan ciabatta.', tag = 'Después del partido' WHERE id = 'menu-3';
UPDATE menu_items SET name = 'Papas rústicas con cheddar y panceta', description = 'Papas con cáscara, salsa de cheddar casera y panceta crocante.', tag = 'Para compartir' WHERE id = 'menu-4';
UPDATE menu_items SET name = 'Promo 2x1 en chopp', description = 'Dos chopps bien helados, tirados en el momento.', tag = 'Promo de la casa' WHERE id = 'menu-5';
UPDATE menu_items SET description = 'Balde con hielo y 6 botellas bien frías para la mesa.', tag = 'Para la mesa' WHERE id = 'menu-6';
UPDATE menu_items SET name = 'Balde x6 Patagonia 24.7', description = 'Balde con hielo y 6 botellitas Patagonia, cerveza suave y cítrica.', tag = 'Cerveza artesanal' WHERE id = 'menu-7';
UPDATE menu_items SET name = 'Chopp 500 ml', description = 'Chopp rubio bien helado, servido en jarra fría.', tag = 'En la barra' WHERE id = 'menu-8';
UPDATE menu_items SET name = 'Corona 355 ml con lima', description = 'Botella con una rodaja de lima.', tag = 'En la barra' WHERE id = 'menu-9';
UPDATE menu_items SET description = 'Bebida isotónica para recuperar sales durante el partido.', tag = 'En la cancha' WHERE id = 'menu-10';
UPDATE menu_items SET description = 'Con o sin gas, bien fría.', tag = NULL WHERE id = 'menu-11';
UPDATE menu_items SET name = 'Coca-Cola / Coca-Cola Zero 500 ml', description = 'Botella individual fría.', tag = NULL WHERE id = 'menu-12';
UPDATE menu_items SET name = 'Red Bull 250 ml', description = 'Lata energizante para antes de jugar.', tag = 'Antes del partido' WHERE id = 'menu-13';
UPDATE menu_items SET name = 'Tubo de pelotas Bullpadel (x3)', description = 'Pelotas nuevas de torneo, con buen rebote y larga duración.', tag = NULL WHERE id = 'menu-14';
UPDATE menu_items SET name = 'Remera oficial Black Club', description = 'Remera deportiva negra de tela liviana que respira, con el logo del club.', tag = 'Del club' WHERE id = 'menu-15';
UPDATE menu_items SET name = 'Gorra oficial Black Club', description = 'Gorra negra con el logo bordado.', tag = 'Del club' WHERE id = 'menu-16';
UPDATE menu_items SET name = 'Cubregrip Bullpadel', description = 'Cinta para el mango con mejor agarre, ideal para días de calor.', tag = NULL WHERE id = 'menu-17';
UPDATE menu_items SET name = 'Alquiler de paleta', description = 'Paleta de buena gama para usar durante tu turno.', tag = NULL WHERE id = 'menu-18';

UPDATE tournaments SET type = 'Torneo oficial del club',
    description = 'Segunda edición del torneo más importante de Black Club, con fase de grupos y llaves de eliminación.'
WHERE id = 'tourn-1';
