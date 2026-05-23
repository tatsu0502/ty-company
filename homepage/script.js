(function () {
  "use strict";

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const form = document.getElementById("contact-form");
  if (!form) return;

  const status = document.getElementById("form-status");
  const submit = form.querySelector('button[type="submit"]');
  const accessKey = form.querySelector('input[name="access_key"]');

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "";
    status.removeAttribute("data-state");

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (!accessKey || accessKey.value.startsWith("REPLACE_")) {
      status.dataset.state = "error";
      status.textContent =
        "フォームの送信先が未設定です。サイト管理者にご連絡ください。";
      return;
    }

    const data = new FormData(form);
    submit.disabled = true;
    const originalLabel = submit.textContent;
    submit.textContent = "送信中…";

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok && json.success !== false) {
        status.dataset.state = "success";
        status.textContent =
          "お問い合わせありがとうございます。送信が完了しました。";
        form.reset();
      } else {
        status.dataset.state = "error";
        status.textContent =
          (json && json.message) ||
          "送信に失敗しました。時間をおいて再度お試しください。";
      }
    } catch (err) {
      status.dataset.state = "error";
      status.textContent =
        "通信エラーが発生しました。ネットワーク環境をご確認ください。";
    } finally {
      submit.disabled = false;
      submit.textContent = originalLabel;
    }
  });
})();
