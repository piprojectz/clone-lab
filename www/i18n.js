/* Interface text in English and Russian.
   t(key, vars) returns the string for the current language; {name} placeholders are filled from vars.
   Entries can be functions when grammar depends on a number (Russian plurals). */
const plRu = (n, one, few, many) => {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b === 1) return one;
  if (b >= 2 && b <= 4) return few;
  return many;
};
const plEn = (n, one, many) => (n === 1 ? one : many);
const nthEn = n => n + (['st', 'nd', 'rd'][((n + 90) % 100 - 10) % 10 - 1] || 'th');

const I18N = {
  en: {
    lang_label: 'Language',
    saved_device: 'Saved on this phone',
    planter_list: 'Planter list',
    manage: 'Manage',
    save_fail: 'Couldn’t save — phone storage may be full.',
    undo: 'Undo',
    ok: 'OK', done: 'Done', cancel: 'Cancel', add: 'Add',

    // manage sheet
    manage_title: 'Manage lists',
    list_name: 'Name of this list',
    rename: 'Rename',
    new_list_lbl: 'Start a new list (one per plant: hemp, corn, berries…)',
    new_list_ph: 'e.g. Hemp — Oct wipe',
    create: 'Create',
    backup: 'Backup',
    backup_help: 'Copy a backup of every list to keep somewhere safe (notes app, email to yourself). Paste it back here to restore, for example on a new phone.',
    copy_backup: 'Copy backup',
    restore: 'Restore…',
    restore_ph: 'Paste a backup here',
    restore_btn: 'Replace all lists with this backup',
    remove_all: 'Remove all clones',
    delete_list: 'Delete list',
    backup_copied: 'Backup copied. Paste it somewhere safe.',
    backup_select: 'Select the text in the box and copy it.',
    confirm_replace: 'Tap again — this replaces everything',
    not_backup_full: 'That isn’t a Clone Lab backup. Copy the whole text and try again.',
    not_backup: 'That isn’t a Clone Lab backup.',
    restored: 'Backup restored',
    renamed: 'List renamed',
    new_list_default: 'New list',
    example_list: 'Example clones',
    created: 'Created “{name}”',
    confirm_remove: 'Tap again to remove {n}',
    cleared: 'List cleared',
    confirm_delete: 'Tap again to delete',
    list_deleted: 'List deleted',

    // clones tab
    add_clones: 'Add clones',
    scan_help: 'Hover a clone in Rust and point the camera at its gene tooltip. The phone reads the six tiles itself and adds the clone once it gets the same reading a few times in a row.',
    scan_cam: 'Scan with camera',
    read_shots: 'Read screenshots',
    k_G: 'growth', k_Y: 'yield', k_H: 'hardy', k_W: 'water', k_X: 'empty',
    back: '⌫ Back', clear: 'Clear',
    keypad_help: 'Or tap six genes and the clone saves itself. Everything saves as you go.',
    paste_title: 'Paste a list instead',
    paste_help: 'Any text with 6-letter gene codes, one per line or all in a row.',
    paste_btn: 'Add from text',
    your_clones: 'Your clones',
    sort: 'Sort', sort_new: 'Newest', sort_num: 'Number', sort_score: 'Score',
    count_lbl: '{n} saved · {on} in use',
    nav_count: '{n} saved',
    example_notice: '<b>These 14 are example clones</b> so you can try the Breed tab right away. Remove them under Manage → Remove all clones, or start a fresh list there.',
    empty_list: 'No clones in this list yet. Scan a tooltip or tap genes on the keypad above.',
    score: 'Score',
    in_use: 'In use', skipped: 'Skipped',
    delete_clone: 'Delete clone #{n}',
    deleted: 'Deleted #{n}',
    added_as: 'Added {g} as #{n}',
    already: '{g} is already #{n}',
    no_codes: 'No 6-letter gene codes found. Use only G, Y, H, W and X.',
    added_n: ({ n }) => `Added ${n} ${plEn(n, 'clone', 'clones')}`,
    dups_in_list: ' · {n} already in list',
    dups_saved: ' · {n} already saved',

    // scan review
    no_genes: 'No genes found',
    no_genes_help: 'No row of six gene tiles was found. Use a full-resolution screenshot with the tooltip open, or try the live camera scan.',
    check_read: 'Check what was read',
    check_help: 'Tap a gene to change it. Rows with a dashed “?” need fixing before they can be added.',
    photo: 'Photo {n}',
    gene_aria: 'Gene {j}: {c}. Tap to change',
    already_saved_as: 'already saved as #{n}',
    add_n_btn: ({ n }) => `Add ${n} ${plEn(n, 'clone', 'clones')}`,
    low_conf: 'Low confidence — double-check',
    reading: 'Reading genes…',
    reading_n: ({ n }) => `Reading ${n} ${plEn(n, 'image', 'images')} on this phone.`,
    reading_i: 'Reading image {i} of {n}…',

    // breed tab
    breed_toward: 'Breed toward',
    t_G: 'growth', t_Y: 'yield', t_H: 'hardy',
    fewer: 'Fewer {k}', more: 'More {k}',
    target_msg: ({ G, Y, H }) => `Looking for any clone with ${G} G, ${Y} Y${H ? `, ${H} H` : ''} in any order. Gene position doesn’t matter in Rust, only the count.`,
    target_bad: 'Genes add up to {s}. A clone has 6, so adjust to 6.',
    max_plants: 'Surrounding plants (max)',
    gen2: 'Look two generations ahead',
    calc: 'Calculate', calcing: 'Calculating…',
    need_two: 'Add at least two clones (and mark them “In use”) to start breeding.',
    k_note: ({ n, want, got }) => `With ${n} clones, checking ${want} surrounding plants would take too long, so this run used up to ${got}. Skip weak clones to search wider.`,
    calc_fail: 'The calculation failed: {e}. Try fewer surrounding plants.',
    step1_clone: 'Step-1 clone',
    planter_aria: 'Planter layout',
    center_cell: 'center<br>plant first',
    steps_any: 'Plant these around the center, in any order: {list}.',
    steps_nth: 'Plant {d} <span class="order">{ord}</span>.',
    ords: ['first', 'second', 'third', 'fourth', 'fifth'],
    steps_then: 'Then plant {list} in any order.',
    steps_copies: 'Clone {list} so you have enough copies.',
    and: ' and ',
    steps_center_first: 'Plant any spare {what} of the same plant in the <b>center first</b>. All six of its genes get replaced, so its own genes don’t matter.',
    steps_wait: 'Wait until the center is about <b>halfway through the sapling stage</b>, then plant the surrounding clones below, one right after another.',
    steps_done: 'The center crossbreeds when it reaches its crossbreed stage. Check its genes once it’s mature, then take clones from it.',
    clone_word: 'clone',
    th_planted: 'Planted', th_slot: 'Slot {i}', weight: 'Weight', result: 'Result',
    note_tie: ({ s, genes, v, who, pos, w }) => `Slot ${s}: ${genes} tie at ${v}. The earliest-planted neighbor carrying one of them is ${who} (planted ${nthEn(pos)}), and it has ${w}, so <b>${w}</b> wins. Plant it later and the result can flip.`,
    note_green: 'Slot {s}: {w} totals {v}, which beats the red gene’s {r}. Two greens outweigh one red.',
    note_red: 'Slot {s}: a red {w} weighs 1.0 and nothing outweighs it here, so the bad gene comes through.',
    gen_pill: 'Gen {n}',
    target_pill: 'Target',
    guaranteed: 'Guaranteed',
    guar_order: 'Guaranteed with planting order',
    random_order: 'Random order:',
    plants_n: ({ n, list }) => `${n} plants: ${list}`,
    step1_h: 'Step 1 · Breed', step2_h: 'Step 2 · Breed',
    why_makes: 'Why this makes {g}',
    why_label: 'Why it turns out this way',
    can_breed: 'You can breed it',
    one_planting: 'One planting from clones you already have.',
    two_plantings: 'Two plantings: breed a stepping-stone clone first, then use it.',
    order_decides: 'Planting order decides ties here, so follow the order below and it’s guaranteed.',
    order_free: 'Order doesn’t matter for this one.',
    not_yet: 'Not possible yet with these clones',
    closest: 'Closest you can make now: {g} (score {s}, {c} of 6 target genes).',
    all_results: 'All results',
    n_possible: ({ n }) => `${n} possible ${plEn(n, 'clone', 'clones')} · best first`,
    show_more: 'Show more',
    what_need: 'What you need',
    no_single: 'No single extra clone gets you to {ts} with what you have. Collect more seeds with {g} genes, or try a different target.',
    look_next: 'What to look for next',
    look_help: 'Each pattern is one new clone that would finish {g} together with clones you already own. Dashed slots can be any gene. When you find one, scan it and calculate again.',
    any_fits: 'any clone fits',
    odds: 'about 1 in {n} random clones fit',
    any: 'any', one_of: 'one of', need: 'need',
    new_clone: 'the new clone',
    plant_order: 'Center first. At half sapling, plant: {seq} →',
    clone_twice: ' · clone the new one once so you have two',

    // tabs
    tab_clones: 'Clones', tab_breed: 'Breed', tab_breed_sub: 'find a god clone', tab_guide: 'How it works', tab_guide_sub: 'genes & order',

    // camera
    cam_aria: 'Gene scanner',
    cam_title: 'Scan genes',
    cam_hint: 'Hover a clone in Rust and fit its six gene tiles inside the box',
    cam_start: 'Starting camera…',
    zoom: 'Zoom',
    auto_add: 'Add automatically',
    show_sees: 'Show what it sees',
    cam_fail: 'The camera couldn’t start. Allow camera access for Clone Lab in Android Settings → Apps → Clone Lab → Permissions, then try again. “Read screenshots” works without the camera.',
    looking: 'Looking for gene tiles…',
    hold: 'hold steady…',
    tap_add: 'tap Add to save',
    added_as_short: 'added as #{n}',
    session_n: '{n} added this session',

    gene_G: 'Growth — grows faster',
    gene_Y: 'Yield — bigger harvest',
    gene_H: 'Hardiness — copes with poor light, water and temperature',
    gene_W: 'Water — needs more water',
    gene_X: 'Empty — does nothing',
    unreadable: 'Unreadable',
    copy: 'copy',
    edit_title: 'Edit clone #{n}',
    edit_help: 'Tap genes on the keypad to retype all six, or tap a single gene to cycle it.',
    save: 'Save', edited: 'Clone #{n} updated', dup_of: 'Those genes are already saved as #{n}.',
    edit_aria: 'Edit genes of clone #{n}',

    guide: ({ why1, why2, table }) => `
  <div class="panel"><h2>The six genes</h2>
    <p>Every clone and seed carries six genes. Green ones help; red ones hurt. Score counts G and Y as 1, H as ½, red as 0.</p>
    ${table}
    <p class="small muted">The middle column is the breeding weight. It’s the key to everything below.</p></div>

  <div class="panel"><h2>How crossbreeding works</h2>
    <p>A young plant takes its genes from the plants growing around it. Each of the six slots is decided on its own:</p>
    <ol class="steps"><li>Look at that slot on every surrounding plant.</li><li>Add up the weights for each gene: 0.6 for each green, 1.0 for each red.</li><li>The heaviest total wins and replaces the center plant’s gene in that slot.</li></ol>
    <p>That’s why one red W (1.0) beats a single green (0.6), but two matching greens (1.2) beat it. You’re stacking the same good gene in the same slot on enough neighbors to outvote the reds.</p>
    <p>The center plant’s own genes don’t count. All six get replaced, so any spare clone of the same plant can go in the middle.</p></div>

  <div class="panel"><h2>Why plant order matters</h2>
    <p>Sometimes two genes tie, like Y 1.2 vs H 1.2. Rust breaks the tie by planting order: the neighbor that went in the ground first decides. Where it sits in the planter doesn’t matter.</p>
    <p>Here’s an example recipe. Slot 1 is a tie between Y and H:</p>
    ${why1}
    <p>Plant a #17 copy first instead and slot 1 flips to H:</p>
    ${why2}
    <p>So when a recipe says “first” or “second”, it means it. When it says “any order”, every order gives the same clone.</p></div>

  <div class="panel"><h2>Two generations</h2>
    <p>If no single planting hits your target, breed a stepping-stone clone first, clone it, then use the copies as neighbors in a second planting. Turn on “Look two generations ahead” on the Breed tab to find these routes.</p></div>

  <div class="panel"><h2>In the game</h2>
    <p>A plant locks in its genes when it reaches its <b>crossbreed stage</b>, using the neighbors planted around it at that moment. Plants that go in early also crossbreed with each other when they get there, and that can change their genes. So the center has to get to crossbreeding <b>before</b> its neighbors do.</p>
    <ol class="steps"><li>Plant a spare clone of the same plant in the <b>center first</b>.</li><li>Wait until it’s about halfway through the sapling stage.</li><li>Plant the surrounding clones right away, in the order the recipe shows (“first”, “second”…). The center reaches crossbreeding while they’re still young, so their genes are exactly what you entered.</li><li>Once the center is mature, check its genes. If they’re right, take clones from it.</li></ol>
    <p class="small muted">Another method: plant the surrounding clones first, wait until they have all finished crossbreeding and are mature, then plant the center. It works too, but the neighbors may have swapped genes with each other by then, so re-check their genes before planting the center.</p>
    <p class="small muted">These rules reflect how crossbreeding works in the current game. Facepunch occasionally changes farming in updates, so if a result ever surprises you in game, re-check the planting order first.</p></div>`
  },

  ru: {
    lang_label: 'Язык',
    saved_device: 'Сохранено на телефоне',
    planter_list: 'Список',
    manage: 'Управление',
    save_fail: 'Не удалось сохранить — возможно, память телефона заполнена.',
    undo: 'Отменить',
    ok: 'ОК', done: 'Готово', cancel: 'Отмена', add: 'Добавить',

    manage_title: 'Списки',
    list_name: 'Название списка',
    rename: 'Переименовать',
    new_list_lbl: 'Новый список (по одному на растение: конопля, кукуруза, ягоды…)',
    new_list_ph: 'например, Конопля — октябрьский вайп',
    create: 'Создать',
    backup: 'Резервная копия',
    backup_help: 'Скопируйте резервную копию всех списков и сохраните её (в заметках или письмом самому себе). Вставьте её сюда, чтобы восстановить списки, например на новом телефоне.',
    copy_backup: 'Копировать',
    restore: 'Восстановить…',
    restore_ph: 'Вставьте резервную копию сюда',
    restore_btn: 'Заменить все списки этой копией',
    remove_all: 'Удалить все клоны',
    delete_list: 'Удалить список',
    backup_copied: 'Копия скопирована. Сохраните её в надёжном месте.',
    backup_select: 'Выделите текст в поле и скопируйте его.',
    confirm_replace: 'Нажмите ещё раз — всё будет заменено',
    not_backup_full: 'Это не резервная копия Clone Lab. Скопируйте текст целиком и попробуйте снова.',
    not_backup: 'Это не резервная копия Clone Lab.',
    restored: 'Копия восстановлена',
    renamed: 'Список переименован',
    new_list_default: 'Новый список',
    example_list: 'Примерные клоны',
    created: 'Создан список «{name}»',
    confirm_remove: 'Нажмите ещё раз, чтобы удалить {n}',
    cleared: 'Список очищен',
    confirm_delete: 'Нажмите ещё раз для удаления',
    list_deleted: 'Список удалён',

    add_clones: 'Добавить клоны',
    scan_help: 'Наведите курсор на клон в Rust и направьте камеру на подсказку с генами. Телефон сам распознаёт шесть плиток и добавит клон, когда несколько раз подряд прочитает одно и то же.',
    scan_cam: 'Сканировать камерой',
    read_shots: 'Из скриншотов',
    k_G: 'рост', k_Y: 'урожай', k_H: 'выносл.', k_W: 'вода', k_X: 'пусто',
    back: '⌫ Назад', clear: 'Очистить',
    keypad_help: 'Или наберите шесть генов — клон сохранится сам. Всё сохраняется автоматически.',
    paste_title: 'Вставить списком',
    paste_help: 'Любой текст с кодами генов из 6 букв — по одному в строке или подряд.',
    paste_btn: 'Добавить из текста',
    your_clones: 'Ваши клоны',
    sort: 'Сортировка', sort_new: 'Новые', sort_num: 'Номер', sort_score: 'Очки',
    count_lbl: 'сохранено: {n} · в работе: {on}',
    nav_count: 'сохранено: {n}',
    example_notice: '<b>Это 14 примерных клонов</b>, чтобы сразу попробовать вкладку «Скрестить». Удалите их в разделе «Управление» → «Удалить все клоны» или создайте там новый список.',
    empty_list: 'В этом списке пока нет клонов. Отсканируйте подсказку или наберите гены на клавиатуре выше.',
    score: 'Очки',
    in_use: 'В работе', skipped: 'Пропущен',
    delete_clone: 'Удалить клон #{n}',
    deleted: 'Клон #{n} удалён',
    added_as: '{g} добавлен как #{n}',
    already: '{g} уже есть: #{n}',
    no_codes: 'Коды из 6 букв не найдены. Используйте только G, Y, H, W и X.',
    added_n: ({ n }) => `Добавлено: ${n} ${plRu(n, 'клон', 'клона', 'клонов')}`,
    dups_in_list: ' · уже в списке: {n}',
    dups_saved: ' · уже сохранено: {n}',

    no_genes: 'Гены не найдены',
    no_genes_help: 'Не найден ряд из шести плиток генов. Используйте скриншот в полном разрешении с открытой подсказкой или попробуйте сканирование камерой.',
    check_read: 'Проверьте результат',
    check_help: 'Нажмите на ген, чтобы изменить его. Строки с пунктирным «?» нужно исправить перед добавлением.',
    photo: 'Фото {n}',
    gene_aria: 'Ген {j}: {c}. Нажмите, чтобы изменить',
    already_saved_as: 'уже сохранён как #{n}',
    add_n_btn: ({ n }) => `Добавить ${n} ${plRu(n, 'клон', 'клона', 'клонов')}`,
    low_conf: 'Распознано неуверенно — проверьте',
    reading: 'Распознаю гены…',
    reading_n: ({ n }) => `Обрабатываю на телефоне: ${n} ${plRu(n, 'изображение', 'изображения', 'изображений')}.`,
    reading_i: 'Изображение {i} из {n}…',

    breed_toward: 'Цель скрещивания',
    t_G: 'рост', t_Y: 'урожай', t_H: 'выносл.',
    fewer: 'Меньше {k}', more: 'Больше {k}',
    target_msg: ({ G, Y, H }) => `Ищем любой клон с ${G} G, ${Y} Y${H ? `, ${H} H` : ''} в любом порядке. В Rust важна не позиция гена, а только их количество.`,
    target_bad: 'Сумма генов: {s}. У клона их 6 — исправьте до 6.',
    max_plants: 'Соседних растений (макс.)',
    gen2: 'Искать на два поколения вперёд',
    calc: 'Рассчитать', calcing: 'Считаю…',
    need_two: 'Добавьте хотя бы два клона (с отметкой «В работе»), чтобы начать.',
    k_note: ({ n, want, got }) => `При ${n} ${plRu(n, 'клоне', 'клонах', 'клонах')} перебор для ${want} соседних растений занял бы слишком много времени, поэтому учтено до ${got}. Пропустите слабые клоны, чтобы искать шире.`,
    calc_fail: 'Ошибка расчёта: {e}. Попробуйте меньше соседних растений.',
    step1_clone: 'Клон шага 1',
    planter_aria: 'Схема грядки',
    center_cell: 'центр<br>сажать первым',
    steps_any: 'Посадите вокруг центра в любом порядке: {list}.',
    steps_nth: 'Посадите {d} <span class="order">{ord}</span>.',
    ords: ['первым', 'вторым', 'третьим', 'четвёртым', 'пятым'],
    steps_then: 'Затем посадите {list} в любом порядке.',
    steps_copies: 'Склонируйте {list}, чтобы хватило копий.',
    and: ' и ',
    steps_center_first: 'Посадите любой лишний {what} того же растения <b>в центр первым</b>. Все шесть его генов будут заменены, так что его собственные гены не важны.',
    steps_wait: 'Дождитесь, пока центральное растение пройдёт примерно <b>половину стадии саженца</b>, затем сразу, одно за другим, посадите соседние клоны:',
    steps_done: 'Центр скрещивается, когда доходит до стадии скрещивания. Проверьте его гены, когда оно созреет, и возьмите с него клоны.',
    clone_word: 'клон',
    th_planted: 'Посажено', th_slot: 'Слот {i}', weight: 'Вес', result: 'Итог',
    note_tie: ({ s, genes, v, who, pos, w }) => `Слот ${s}: ничья между ${genes} — по ${v}. Раньше всех из соседей с одним из этих генов посажен ${who} (${pos}-м), у него ${w}, поэтому побеждает <b>${w}</b>. Посадите его позже — и результат может измениться.`,
    note_green: 'Слот {s}: у {w} сумма {v}, это больше, чем {r} у красного гена. Два зелёных перевешивают один красный.',
    note_red: 'Слот {s}: красный {w} весит 1.0, и здесь его ничто не перевешивает, поэтому плохой ген проходит.',
    gen_pill: 'Пок. {n}',
    target_pill: 'Цель',
    guaranteed: 'Гарантировано',
    guar_order: 'Гарантировано при нужном порядке',
    random_order: 'Случайный порядок:',
    plants_n: ({ n, list }) => `${n} ${plRu(n, 'растение', 'растения', 'растений')}: ${list}`,
    step1_h: 'Шаг 1 · Вывести', step2_h: 'Шаг 2 · Вывести',
    why_makes: 'Почему получается {g}',
    why_label: 'Почему так получается',
    can_breed: 'Это можно вывести',
    one_planting: 'Одна посадка из клонов, которые у вас уже есть.',
    two_plantings: 'Две посадки: сначала выведите промежуточный клон, затем используйте его.',
    order_decides: 'Здесь ничьи решает порядок посадки — соблюдайте порядок ниже, и результат гарантирован.',
    order_free: 'Порядок посадки здесь не важен.',
    not_yet: 'С этими клонами пока не выйдет',
    closest: 'Ближе всего сейчас: {g} (очки {s}, совпадает {c} из 6 генов цели).',
    all_results: 'Все результаты',
    n_possible: ({ n }) => `${n} ${plRu(n, 'вариант', 'варианта', 'вариантов')} · лучшие сверху`,
    show_more: 'Показать ещё',
    what_need: 'Что нужно',
    no_single: 'Ни один дополнительный клон не даст {ts} с тем, что у вас есть. Соберите больше семян с генами {g} или выберите другую цель.',
    look_next: 'Что искать дальше',
    look_help: 'Каждый шаблон — это один новый клон, который вместе с вашими клонами даст {g}. Пунктирные слоты — любой ген. Когда найдёте такой, отсканируйте его и пересчитайте.',
    any_fits: 'подойдёт любой клон',
    odds: 'подходит примерно 1 из {n} случайных клонов',
    any: 'любой', one_of: 'один из', need: 'нужен',
    new_clone: 'новый клон',
    plant_order: 'Сначала центр. На половине стадии саженца посадите: {seq} →',
    clone_twice: ' · склонируйте новый клон, чтобы их было два',

    tab_clones: 'Клоны', tab_breed: 'Скрестить', tab_breed_sub: 'идеальный клон', tab_guide: 'Справка', tab_guide_sub: 'гены и порядок',

    cam_aria: 'Сканер генов',
    cam_title: 'Сканирование',
    cam_hint: 'Наведите курсор на клон в Rust и поместите шесть плиток генов в рамку',
    cam_start: 'Запуск камеры…',
    zoom: 'Зум',
    auto_add: 'Добавлять сразу',
    show_sees: 'Показать, что видит',
    cam_fail: 'Не удалось запустить камеру. Разрешите доступ: Настройки Android → Приложения → Clone Lab → Разрешения, затем попробуйте снова. «Из скриншотов» работает без камеры.',
    looking: 'Ищу плитки генов…',
    hold: 'не двигайте…',
    tap_add: 'нажмите «Добавить»',
    added_as_short: 'добавлен как #{n}',
    session_n: 'добавлено за сеанс: {n}',

    gene_G: 'Рост — растёт быстрее',
    gene_Y: 'Урожай — больше урожая',
    gene_H: 'Выносливость — переносит плохое освещение, нехватку воды и неподходящую температуру',
    gene_W: 'Вода — нужно больше воды',
    gene_X: 'Пусто — ничего не делает',
    unreadable: 'Не распознан',
    copy: 'копия',
    edit_title: 'Изменить клон #{n}',
    edit_help: 'Наберите все шесть генов на клавиатуре или нажмите на отдельный ген, чтобы сменить его.',
    save: 'Сохранить', edited: 'Клон #{n} изменён', dup_of: 'Такие гены уже сохранены как #{n}.',
    edit_aria: 'Изменить гены клона #{n}',

    guide: ({ why1, why2, table }) => `
  <div class="panel"><h2>Шесть генов</h2>
    <p>У каждого клона и семени шесть генов. Зелёные полезны, красные вредны. Очки: G и Y — по 1, H — ½, красные — 0.</p>
    ${table}
    <p class="small muted">Средний столбец — вес гена при скрещивании. От него зависит всё, что описано ниже.</p></div>

  <div class="panel"><h2>Как работает скрещивание</h2>
    <p>Молодое растение получает гены от растений, растущих вокруг него. Каждый из шести слотов определяется отдельно:</p>
    <ol class="steps"><li>Берём этот слот у каждого соседнего растения.</li><li>Складываем веса для каждого гена: 0.6 за каждый зелёный, 1.0 за каждый красный.</li><li>Ген с наибольшей суммой побеждает и заменяет ген центрального растения в этом слоте.</li></ol>
    <p>Поэтому один красный W (1.0) сильнее одного зелёного (0.6), но два одинаковых зелёных (1.2) его перевешивают. Нужно, чтобы у достаточного числа соседей в одном и том же слоте стоял один и тот же хороший ген.</p>
    <p>Собственные гены центрального растения не учитываются — все шесть заменяются, так что в центр можно посадить любой лишний клон того же растения.</p></div>

  <div class="panel"><h2>Почему важен порядок посадки</h2>
    <p>Иногда два гена набирают одинаковый вес, например Y 1.2 и H 1.2. Rust решает ничью по порядку посадки: решает тот сосед, которого посадили раньше. Место на грядке значения не имеет.</p>
    <p>Вот пример рецепта. В слоте 1 ничья между Y и H:</p>
    ${why1}
    <p>Если первой посадить копию #17, слот 1 станет H:</p>
    ${why2}
    <p>Поэтому если в рецепте написано «первым» или «вторым» — так и сажайте. Если написано «в любом порядке», любой порядок даст тот же клон.</p></div>

  <div class="panel"><h2>Два поколения</h2>
    <p>Если одной посадкой цель не получается, сначала выведите промежуточный клон, склонируйте его и используйте копии как соседей во второй посадке. Включите «Искать на два поколения вперёд» на вкладке «Скрестить», чтобы найти такие пути.</p></div>

  <div class="panel"><h2>В игре</h2>
    <p>Растение фиксирует гены, когда доходит до <b>стадии скрещивания</b>, — по соседям, которые посажены вокруг него в этот момент. Растения, посаженные заранее, тоже скрещиваются друг с другом, когда до неё доходят, и их гены могут измениться. Поэтому центр должен дойти до скрещивания <b>раньше</b> соседей.</p>
    <ol class="steps"><li>Посадите лишний клон того же растения <b>в центр первым</b>.</li><li>Дождитесь, пока он пройдёт примерно половину стадии саженца.</li><li>Сразу посадите соседние клоны в порядке из рецепта («первым», «вторым»…). Центр дойдёт до скрещивания, пока они ещё молодые, так что их гены будут именно такими, как вы ввели.</li><li>Когда центр созреет, проверьте его гены. Если всё верно, возьмите с него клоны.</li></ol>
    <p class="small muted">Другой способ: сначала посадите соседние клоны, дождитесь, пока все они пройдут скрещивание и созреют, и только потом сажайте центр. Это тоже работает, но к тому времени соседи могли обменяться генами, поэтому перед посадкой центра перепроверьте их гены.</p>
    <p class="small muted">Эти правила соответствуют тому, как скрещивание работает в текущей версии игры. Facepunch иногда меняет фермерство в обновлениях, поэтому если результат в игре вас удивит, первым делом перепроверьте порядок посадки.</p></div>`
  }
};

let LANG = 'en';
try {
  const saved = localStorage.getItem('rcl-lang');
  LANG = saved === 'ru' || saved === 'en' ? saved : ((navigator.language || '').toLowerCase().startsWith('ru') ? 'ru' : 'en');
} catch (e) {}

function t(key, vars = {}) {
  let s = I18N[LANG][key];
  if (s === undefined) s = I18N.en[key];
  if (s === undefined) return key;
  if (typeof s === 'function') return s(vars);
  if (typeof s !== 'string') return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
}

// Fill static markup: data-i18n (text), data-i18n-html, data-i18n-ph (placeholder), data-i18n-aria
function applyStatic(root = document) {
  document.documentElement.lang = LANG;
  root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  root.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  root.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === LANG));
}
