/* «Сделай красиво» — логика сайта.
   Единственное, что нужно настроить, — блок CONFIG ниже. */

var CONFIG = {
  // Ник в Telegram без «собаки». Подставляется в ссылки в подвале
  // и используется как запасной канал для заявок.
  telegram: "sdelaykrasivo",

  // Необязательно. Адрес приёма формы: Formspree, Getform или свой скрипт.
  // Если оставить пустым — заявка уйдёт в Telegram готовым сообщением.
  endpoint: ""
};

/* ---------- Ссылки на Telegram ---------- */

(function () {
  var links = document.querySelectorAll("[data-tg]");
  for (var i = 0; i < links.length; i++) {
    links[i].href = "https://t.me/" + CONFIG.telegram;
    links[i].target = "_blank";
    links[i].rel = "noopener";
  }
})();

/* ---------- Появление секций ---------- */

(function () {
  var items = document.querySelectorAll(".section, .hero__grid");
  if (!items.length) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !("IntersectionObserver" in window)) return;

  for (var i = 0; i < items.length; i++) items[i].classList.add("reveal");

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: "0px 0px -60px 0px", threshold: 0.02 });

  for (var j = 0; j < items.length; j++) io.observe(items[j]);
})();

/* ---------- Форма заявки ---------- */

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

    var text = "Заявка на созвон\n" +
      "Имя: " + data.name + "\n" +
      "Школа: " + data.school + "\n" +
      "Контакт: " + data.contact +
      (data.task ? "\nЗадача: " + data.task : "");

    if (!CONFIG.endpoint) {
      window.open("https://t.me/" + CONFIG.telegram + "?text=" + encodeURIComponent(text), "_blank", "noopener");
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
