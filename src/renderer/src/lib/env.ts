// Режим «без анимаций» (?static в адресе): для скриншотов и проверок в фоновой вкладке,
// где браузер притормаживает анимации и кадр ловится на середине появления.
export const STATIC_MODE = new URLSearchParams(window.location.search).has('static')
if (STATIC_MODE) document.documentElement.classList.add('static-mode')
