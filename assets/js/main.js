/* «Сделай красиво» — логика сайта.
   Настройка приёма заявок — в блоке CONFIG ниже. */

var CONFIG = {
  // Вариант 1. Форма уходит на ваш endpoint (Formspree, Getform, свой скрипт).
  // Вставьте адрес — и заявки начнут приходить на почту.
  // Пример: "https://formspree.io/f/xxxxxxx"
  endpoint: "",

  // Вариант 2 (запасной). Если endpoint пустой, кнопка откроет Telegram
  // с уже написанным сообщением. Укажите свой ник без @.
  telegram: "your_username"
};

/* ---------- Появление секций при прокрутке ---------- */

(function () {
  var items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-in"); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: "0px 0px -80px 0px" });

  items.forEach(function (el) { io.observe(el); });
})();

/* ---------- Форма записи ---------- */

(function () {
  var form = document.getElementById("callForm");
  if (!form) return;

  var status = document.getElementById("formStatus");
  var button = form.querySelector("button[type=submit]");

  function say(text, kind) {
    status.textContent = text;
    status.className = "form__status" + (kind ? " is-" + kind : "");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var data = {
      name: form.name.value.trim(),
      school: form.school.value.trim(),
      contact: form.contact.value.trim(),
      task: form.task.value.trim()
    };

    if (!data.name || !data.school || !data.contact) {
      say("Заполните имя, школу и контакт — этого достаточно.", "err");
      return;
    }

    var text =
      "Заявка на созвон\n" +
      "Имя: " + data.name + "\n" +
      "Школа: " + data.school + "\n" +
      "Контакт: " + data.contact +
      (data.task ? "\nЗадача: " + data.task : "");

    if (!CONFIG.endpoint) {
      window.open(
        "https://t.me/" + CONFIG.telegram + "?text=" + encodeURIComponent(text),
        "_blank",
        "noopener"
      );
      say("Открыли Telegram — отправьте сообщение, и мы свяжемся с вами.", "ok");
      return;
    }

    button.disabled = true;
    say("Отправляем…");

    fetch(CONFIG.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        if (!res.ok) throw new Error("bad status");
        form.reset();
        say("Записали. Свяжемся с вами в течение рабочего дня.", "ok");
      })
      .catch(function () {
        say("Не отправилось. Напишите нам в Telegram: @" + CONFIG.telegram, "err");
      })
      .then(function () {
        button.disabled = false;
      });
  });
})();
