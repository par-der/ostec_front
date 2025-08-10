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