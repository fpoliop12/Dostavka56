document.addEventListener("DOMContentLoaded", () => {
  try {
    // Общие переменные
    const orderItemsDiv = document.getElementById("order-items");
    const orderTotalSpan = document.getElementById("order-total");
    const orderSubtotalSpan = document.getElementById("order-subtotal");
    const orderDiscountSpan = document.getElementById("order-discount");
    const cartItemsCount = document.querySelector(".cart-link span");
    const deliveryAddressSpan = document.getElementById("delivery-address");
    const deliveryCommentSpan = document.getElementById("delivery-comment");
    const paymentMethodSpan = document.getElementById("payment-method");
    const estimatedTimeSpan = document.getElementById("estimated-time");
    const loginButton = document.querySelector(".login-button");
    const userInfo = document.getElementById("userInfo");
    const usernameDisplay = document.getElementById("usernameDisplay");
    const logoutButton = document.getElementById("logoutButton");

    // Загружаем данные завершённого заказа вместо корзины
    let order = JSON.parse(localStorage.getItem("completedOrder")) || [];
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

    // Отображение деталей заказа
    const updateOrderDisplay = () => {
      if (
        !cartItemsCount ||
        !orderItemsDiv ||
        !orderSubtotalSpan ||
        !orderDiscountSpan ||
        !orderTotalSpan
      )
        return;

      cartItemsCount.textContent = order.length;

      if (order.length === 0) {
        orderItemsDiv.innerHTML = `
          <div class="empty-cart">
            <img src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png" alt="Empty cart" width="80">
            <p>Ваш заказ пуст</p>
          </div>
        `;
      } else {
        orderItemsDiv.innerHTML = order
          .map(
            (item) => `
              <div class="order-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="order-item-info">
                  <div class="order-item-title">${item.name}</div>
                  <div class="order-item-price">${item.price} ₽</div>
                </div>
              </div>
            `
          )
          .join("");

        const subtotal = order.reduce((sum, item) => sum + item.price, 0);
        const discount = discountApplied ? subtotal * 0.2 : 0;
        const total = subtotal - discount;

        orderSubtotalSpan.textContent = subtotal.toFixed(2) + " ₽";
        orderDiscountSpan.textContent = discount.toFixed(2) + " ₽";
        orderTotalSpan.textContent = total.toFixed(2) + " ₽";
      }

      // Очищаем completedOrder после отображения
      localStorage.removeItem("completedOrder");
    };

    // Отображение информации о доставке
    const updateDeliveryInfo = () => {
      if (deliveryAddressSpan && deliveryCommentSpan && paymentMethodSpan) {
        const address = localStorage.getItem("deliveryAddress") || "Не указан";
        const comment =
          localStorage.getItem("deliveryComment") || "Отсутствует";
        const paymentMethod =
          localStorage.getItem("paymentMethod") || "Не указан";
        deliveryAddressSpan.textContent = address;
        deliveryCommentSpan.textContent = comment;
        paymentMethodSpan.textContent =
          paymentMethod === "cash" ? "Наличными курьеру" : "Картой курьеру";
      }

      if (estimatedTimeSpan) {
        estimatedTimeSpan.textContent = "30-45 минут";
      }
    };

    // Обработчик выхода
    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("username");
        if (loginButton && userInfo) {
          loginButton.style.display = "block";
          userInfo.style.display = "none";
        }
        showNotification("Вы вышли из аккаунта.");
      });
    }

    // Инициализация
    updateOrderDisplay();
    updateDeliveryInfo();
  } catch (error) {
    console.error("Ошибка в confirm.js:", error);
  }
});
