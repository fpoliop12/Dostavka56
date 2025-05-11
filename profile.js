document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const profileImage = document.getElementById("profile-image");
  const profilePictureUpload = document.getElementById(
    "profile-picture-upload"
  );
  const profileUsername = document.getElementById("profile-username");
  const profileEmail = document.getElementById("profile-email");
  const profilePassword = document.getElementById("profile-password");
  const profileForm = document.getElementById("profile-form");
  const profileMessage = document.getElementById("profile-message");
  const logoutButton = document.querySelector(".logout-button");
  const contactButton = document.querySelector(".contact-button");

  // Проверка авторизации
  if (!currentUser) {
    window.location.href = "glavnii.html";
    return;
  }

  // Загрузка данных пользователя
  const user = users.find((u) => u.username === currentUser.username);
  if (user) {
    profileUsername.value = user.username;
    profileEmail.value = user.email;
    profileImage.src = user.profilePicture || "img/default_avatar.png";
  }

  // Обработка загрузки изображения
  profilePictureUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        profileImage.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      profileMessage.textContent = "Пожалуйста, выберите изображение";
      profileMessage.classList.add("error");
    }
  });

  // Обработка формы профиля
  profileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const newUsername = profileUsername.value.trim();
    const newEmail = profileEmail.value.trim();
    const newPassword = profilePassword.value.trim();

    // Валидация
    if (
      users.some(
        (u) => u.username === newUsername && u.username !== user.username
      )
    ) {
      profileMessage.textContent = "Имя пользователя уже занято";
      profileMessage.classList.add("error");
      return;
    }
    if (users.some((u) => u.email === newEmail && u.email !== user.email)) {
      profileMessage.textContent = "Email уже зарегистрирован";
      profileMessage.classList.add("error");
      return;
    }

    // Обновление данных пользователя
    user.username = newUsername;
    user.email = newEmail;
    if (newPassword) user.password = newPassword;
    user.profilePicture = profileImage.src;

    // Обновление localStorage
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem(
      "currentUser",
      JSON.stringify({ username: newUsername })
    );

    profileMessage.textContent = "Профиль успешно обновлен!";
    profileMessage.classList.add("success");
    setTimeout(() => {
      profileMessage.textContent = "";
      profileMessage.classList.remove("success");
    }, 3000);
  });

  // Выход
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "glavnii.html";
  });

  // Переход на контакты
  contactButton.addEventListener("click", () => {
    window.location.href = "gl Mlglavnii.html#contacts";
  });
});
