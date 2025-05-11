document.addEventListener("DOMContentLoaded", () => {
  try {
    // Общие переменные
    const cartItemsDiv = document.getElementById("cart-items");
    const cartTotalSpan = document.getElementById("cart-total");
    const cartSubtotalSpan = document.getElementById("cart-subtotal");
    const cartDiscountSpan = document.getElementById("cart-discount");
    const cartItemsCount = document.querySelector(".cart-link span");
    const deliveryForm = document.getElementById("deliveryForm");
    const loginButton = document.querySelector(".login-button");
    const userInfo = document.getElementById("userInfo");
    const usernameDisplay = document.getElementById("usernameDisplay");
    const logoutButton = document.getElementById("logoutButton");

    let cart = JSON.parse(localStorage.getItem("pizzaCart")) || [];
    let discountApplied =
      JSON.parse(localStorage.getItem("pizzaDiscountApplied")) || false;

    // Проверка статуса авторизации
    if (
      localStorage.getItem("isLoggedIn") === "true" &&
      loginButton &&
      userInfo &&
      usernameDisplay
    ) {
      loginButton.style.display = "none";
      userInfo.style.display = "flex";
      usernameDisplay.textContent =
        localStorage.getItem("username") || "Пользователь";
    } else if (loginButton && userInfo) {
      loginButton.style.display = "block";
      userInfo.style.display = "none";
    }

    // Функция для показа уведомлений
    const showNotification = (message) => {
      const notification = document.getElementById("notification");
      if (notification) {
        notification.textContent = message;
        notification.style.display = "block";
        setTimeout(() => {
          notification.style.display = "none";
        }, 3000);
      }
    };

    // Обновление корзины
    const updateCartDisplay = () => {
      if (
        !cartItemsCount ||
        !cartItemsDiv ||
        !cartSubtotalSpan ||
        !cartDiscountSpan ||
        !cartTotalSpan
      )
        return;

      cartItemsCount.textContent = cart.length;

      if (cart.length === 0) {
        cartItemsDiv.innerHTML = `
          <div class="empty-cart">
            <img src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png" alt="Empty cart" width="80">
            <p>Ваша корзина пуста</p>
          </div>
        `;
      } else {
        cartItemsDiv.innerHTML = cart
          .map(
            (item) => `
              <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                  <div class="cart-item-title">${item.name}</div>
                  <div class="cart-item-price">${item.price} ₽</div>
                </div>
              </div>
            `
          )
          .join("");

        const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
        const discount = discountApplied ? subtotal * 0.2 : 0;
        const total = subtotal - discount;

        cartSubtotalSpan.textContent = subtotal.toFixed(2) + " ₽";
        cartDiscountSpan.textContent = discount.toFixed(2) + " ₽";
        cartTotalSpan.textContent = total.toFixed(2) + " ₽";
      }
    };

    // Обработчик формы доставки
    if (deliveryForm) {
      deliveryForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const address = document.getElementById("deliveryAddress")?.value;
        const comment = document.getElementById("deliveryComment")?.value;

        if (cart.length === 0) {
          showNotification("Ваша корзина пуста!");
          return;
        }

        if (!address) {
          showNotification("Пожалуйста, укажите адрес доставки.");
          return;
        }

        localStorage.setItem("deliveryAddress", address);
        localStorage.setItem("deliveryComment", comment);
        showNotification("Заказ успешно оформлен! Перейдите к оплате.");
        setTimeout(() => {
          window.location.href = "oplata.html";
        }, 2000);
      });
    }

    // Обработчик выхода
    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        localStorage.removeItem("isLoggedIn");
        if (loginButton && userInfo) {
          loginButton.style.display = "block";
          userInfo.style.display = "none";
        }
        showNotification("Вы вышли из аккаунта.");
      });
    }

    // Инициализация
    updateCartDisplay();
  } catch (error) {
    console.error("Ошибка в zakaz.js:", error);
  }
});
