fetch("/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password })
});
