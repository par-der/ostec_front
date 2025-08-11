document.addEventListener('DOMContentLoaded', () => {
    const slider = new Swiper('.offers__slider', {
        slidesPerView: 1,
        loop: true,
        spaceBetween: 0,
        pagination: { el: '.offers__pagination', clickable: true },
        navigation: {
            nextEl: '.offers__nav--next',
            prevEl: '.offers__nav--prev'
        },
        a11y: { enabled: true }
    });

    // уважение к пользователю: отключаем автоплей, если предпочитает меньше анимаций
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        slider.autoplay.stop();
    }
});

(() => {
    const MONTHS_GEN = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];

    const root   = document.querySelector('.events');
    const daysEl = document.querySelector('[data-events-days]');
    const listEl = document.querySelector('[data-events-list]');

    const today = new Date();
    const year  = today.getFullYear();
    const month = today.getMonth();

    function updateUI() {
        const count = listEl.children.length;
        root.classList.toggle('events--has-items', count > 0);

        const FIRST = 75;   // первая добавка
        const STEP  = 51;   // все последующие
        const extra = count > 0 ? FIRST + (count - 1) * STEP : 0;

        root.style.setProperty('--events-extra-h', `${extra}px`);
    }

    function renderCalendar(y, m) {
        daysEl.innerHTML = '';
        const first = new Date(y, m, 1);
        const lastDay = new Date(y, m + 1, 0).getDate();
        let shift = first.getDay(); shift = shift === 0 ? 6 : shift - 1;

        for (let i = 0; i < shift; i++) {
            const empty = document.createElement('div');
            empty.className = 'events__cell events__cell--empty';
            daysEl.appendChild(empty);
        }
        for (let d = 1; d <= lastDay; d++) {
            const wd = new Date(y, m, d).getDay();
            const isWeekend = (wd === 0 || wd === 6);
            const cell = document.createElement('button');
            cell.type = 'button';
            cell.className = 'events__cell' + (isWeekend ? ' events__cell--weekend' : '');
            cell.textContent = d;
            cell.setAttribute('aria-pressed', 'false');
            cell.addEventListener('click', () => toggleDay(cell, y, m, d));
            daysEl.appendChild(cell);
        }
        updateUI(); // на старте 0 px
    }

    function toggleDay(cell, y, m, d) {
        const selected = cell.classList.toggle('events__cell--selected');
        cell.setAttribute('aria-pressed', String(selected));
        const id = `event-${y}-${m+1}-${d}`;
        selected ? addEventItem(id, d, m) : removeEventItem(id);
    }

    function addEventItem(id, day, monthIdx) {
        if (document.getElementById(id)) return;

        const item = document.createElement('div');
        item.className = 'events__item';
        item.id = id;

        item.innerHTML = `
            <div class="events__item-main">
              <div class="events__item-title">Название события длинное</div>
              <div class="events__item-date">${day} ${MONTHS_GEN[monthIdx]}</div>
            </div>
            <button class="events__pin" type="button" aria-label="Закрепить">
              <img class="events__pin-ico" src="/images/icons/pin_active.svg" alt="" aria-hidden="true">
            </button>
          `;

        listEl.appendChild(item);
        updateUI && updateUI(); // если используешь функцию из предыдущего шага
    }

    function removeEventItem(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
        updateUI();
    }

    renderCalendar(year, month);
})();

// модификатор скрола для найма сотрукдников только когда полоса есть и она «съедает» ширину
(function initHiresEdge() {
    const lists = document.querySelectorAll('.hires__list'); // работаем только с блоком «Новые сотрудники»

    lists.forEach((list) => {
        const root = list.closest('.hires');

        const apply = () => {
            const hasVScroll = list.scrollHeight > list.clientHeight + 1;
            list.classList.toggle('hires__list--edge', hasVScroll);

            // чтобы не промахнуться с паддингом контейнера
            if (root) {
                const padRight = parseFloat(getComputedStyle(root).paddingRight) || 0;
                root.style.setProperty('--hires-pad', padRight + 'px');
            }
        };

        // старт + реакции на изменения
        apply();
        new MutationObserver(apply).observe(list, { childList: true });
        new ResizeObserver(apply).observe(list);
        window.addEventListener('resize', apply);
        if (document.fonts?.ready) document.fonts.ready.then(apply);
    });
})();

// модификатор скрола для др сотрукдников только когда полоса есть и она «съедает» ширину
(function initBirthdaysEdge() {
    const lists = document.querySelectorAll('.birthdays__list');

    lists.forEach((list) => {
        const root = list.closest('.birthdays');

        const apply = () => {
            const hasVScroll = list.scrollHeight > list.clientHeight + 1;
            list.classList.toggle('birthdays__list--edge', hasVScroll);

            // если захочешь вариант с переменной паддинга контейнера (см. CSS выше)
            if (root) {
                const padRight = parseFloat(getComputedStyle(root).paddingRight) || 0;
                root.style.setProperty('--birthdays-pad', padRight + 'px');
            }
        };

        apply();
        new MutationObserver(apply).observe(list, { childList: true });
        new ResizeObserver(apply).observe(list);
        window.addEventListener('resize', apply);
        if (document.fonts?.ready) document.fonts.ready.then(apply);
    });
})();

// раскрытие сайдбара при наведении мышки на него
(function sidebarHoverExpand(){
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    const pinBtn = sidebar.querySelector('.sidebar__pin');
    let collapseTO;
    const collapseDelay = 400; // было 120 — сделаем мягче

    const expand = () => {
        clearTimeout(collapseTO);
        sidebar.classList.add('sidebar--expanded');
    };

    const collapse = () => {
        clearTimeout(collapseTO);
        collapseTO = setTimeout(() => {
            sidebar.classList.remove('sidebar--expanded');
        }, collapseDelay);
    };

    // hover / focus
    sidebar.addEventListener('mouseenter', expand);
    sidebar.addEventListener('mouseleave', collapse);
    sidebar.addEventListener('focusin', expand);
    sidebar.addEventListener('focusout', (e) => {
        if (!sidebar.contains(e.relatedTarget)) collapse();
    });

    // тач — открыть на 2 сек
    sidebar.addEventListener('touchstart', () => {
        expand();
        clearTimeout(collapseTO);
        collapseTO = setTimeout(collapse, 2000);
    }, {passive:true});

    // клик по пину: просто меняем SVG (серый ↔︎ зелёный)
    if (pinBtn) {
        const ico = pinBtn.querySelector('.sidebar__pin-ico');
        const def = pinBtn.dataset.iconDefault;
        const act = pinBtn.dataset.iconActive;

        pinBtn.addEventListener('click', () => {
            const pressed = pinBtn.getAttribute('aria-pressed') === 'true';
            pinBtn.setAttribute('aria-pressed', String(!pressed));
            if (ico && def && act) ico.src = pressed ? def : act;
            // если нужно, можно добавить поведение "закрепить раскрытым":
            // document.body.classList.toggle('has-sidebar-expanded', !pressed);
            // sidebar.classList.toggle('sidebar--expanded', !pressed);
        });
    }
})();

// дропдаун хедер
(function initHeaderStatus(){
    const root = document.querySelector('[data-status]');
    if (!root) return;

    const btn = root.querySelector('.header__status-btn');
    const menu = root.querySelector('.status-dd');
    const label = root.querySelector('[data-status-text]');
    const iconInBtn = root.querySelector('[data-status-icon]');

    const open = () => {
        root.classList.add('is-open');
        btn.setAttribute('aria-expanded','true');
        menu.hidden = false;
    };
    const close = () => {
        root.classList.remove('is-open');
        btn.setAttribute('aria-expanded','false');
        menu.hidden = true;
    };
    const toggle = () => root.classList.contains('is-open') ? close() : open();

    btn.addEventListener('click', (e)=>{ e.stopPropagation(); toggle(); });

    // выбор пункта
    menu.addEventListener('click', (e)=>{
        const item = e.target.closest('.status-dd__item'); if (!item) return;

        // снять прошлый active
        menu.querySelectorAll('.status-dd__item').forEach(i=>{
            i.classList.remove('is-active'); i.setAttribute('aria-checked','false');
        });

        // пометить текущий
        item.classList.add('is-active'); item.setAttribute('aria-checked','true');

        // обновить кнопку
        const text = item.dataset.text;
        const icon = item.dataset.icon;
        const iconActive = item.dataset.iconActive; // опционально
        if (label && text) label.textContent = text;
        if (iconInBtn && (iconActive || icon)) iconInBtn.src = iconActive || icon;

        close();
    });

    // закрытие по клику вне/ESC
    document.addEventListener('click', (e)=>{ if (!root.contains(e.target)) close(); });
    document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') close(); });
})();


addEventListener('DOMContentLoaded', () => {
    const root  = document.querySelector('[data-search]');
    if (!root) return;

    const input = root.querySelector('.header__search-input');
    const popup = root.querySelector('.search-popup');
    const items = [...root.querySelectorAll('.search-dd__item')];

    const open  = () => root.classList.add('is-open');
    const close = () => root.classList.remove('is-open');

    // показываем список всегда, когда поле активно
    input.addEventListener('focus', open);
    input.addEventListener('input', open);
    input.addEventListener('click', open);

    // выбор по клику
    items.forEach(li => {
        li.addEventListener('click', () => {
            input.value = li.textContent.trim();
            close();
            input.dispatchEvent(new Event('change'));
        });
    });

    // клавиатура: Enter = выбрать первый (или активный), Esc = закрыть
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
        if (e.key === 'Enter') {
            (root.querySelector('.search-dd__item.is-active') || items[0])?.click();
        }
    });

    // простая навигация стрелками по списку
    let idx = -1;
    input.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        e.preventDefault(); open();
        idx = e.key === 'ArrowDown' ? Math.min(idx + 1, items.length - 1)
            : Math.max(idx - 1, 0);
        items.forEach((el, i) => el.classList.toggle('is-active', i === idx));
        items[idx].scrollIntoView({ block: 'nearest' });
    });

    // клик вне — закрыть
    document.addEventListener('click', (e) => {
        if (!root.contains(e.target)) close();
    });
});