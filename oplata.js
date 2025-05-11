document.addEventListener("DOMContentLoaded", () => {
  try {
    // Общие переменные
    const cartItemsDiv = document.getElementById("cart-items");
    const cartTotalSpan = document.getElementById("cart-total");
    const cartSubtotalSpan = document.getElementById("cart-subtotal");
    const cartDiscountSpan = document.getElementById("cart-discount");
    const cartItemsCount = document.querySelector(".cart-link span");
    const paymentForm = document.getElementById("paymentForm");
    const deliveryAddressSpan = document.getElementById("delivery-address");
    const deliveryCommentSpan = document.getElementById("delivery-comment");
    const estimatedTimeSpan = document.getElementById("estimated-time");
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
                <button class="remove-from-cart" data-id="${item.id}">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                    <path d="M4 6H16"></path>
                    <path d="M8 6V4H12V6"></path>
                    <path d="M15 6V16C15 17.1046 14.1046 18 13 18H7C5.89543 18 5 17.1046 5 16V6"></path>
                    <path d="M8 10V14"></path>
                    <path d="M12 10V14"></path>
                  </svg>
                </button>
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

      localStorage.setItem("pizzaCart", JSON.stringify(cart));
    };

    // Добавление товара в корзину
    const addToCart = (productName, productPrice, productImage) => {
      const product = {
        name: productName,
        price: productPrice,
        image: productImage,
        id: Date.now(),
      };

      cart.push(product);
      updateCartDisplay();
      showNotification(`${productName} добавлен в корзину!`);
    };

    // Удаление товара из корзины
    const removeFromCart = (productId) => {
      const productToRemove = cart.find((item) => item.id === productId);
      if (productToRemove) {
        cart = cart.filter((item) => item.id !== productId);
        updateCartDisplay();
        showNotification(`${productToRemove.name} удалён из корзины.`);
      }
    };

    // Отображение информации о доставке
    const updateDeliveryInfo = () => {
      if (deliveryAddressSpan && deliveryCommentSpan) {
        const address = localStorage.getItem("deliveryAddress") || "Не указан";
        const comment =
          localStorage.getItem("deliveryComment") || "Отсутствует";
        deliveryAddressSpan.textContent = address;
        deliveryCommentSpan.textContent = comment;
      }

      if (estimatedTimeSpan) {
        estimatedTimeSpan.textContent = "30-45 минут";
      }
    };

    // Обработчик кнопок добавления в корзину
    const addToCartButtons = document.querySelectorAll(".add-to-cart") || [];
    addToCartButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const productItem = button.closest(".product-item");
        if (productItem) {
          const productName = productItem.querySelector("h3")?.textContent;
          const productPrice = parseFloat(
            productItem.querySelector(".product-price")?.textContent
          );
          const productImage = productItem.querySelector("img")?.src;
          if (productName && productPrice && productImage) {
            addToCart(productName, productPrice, productImage);
          }
        }
      });
    });

    // Обработчик кнопок удаления из корзины
    document.addEventListener("click", (event) => {
      if (event.target.closest(".remove-from-cart")) {
        const button = event.target.closest(".remove-from-cart");
        const productId = parseInt(button.dataset.id);
        removeFromCart(productId);
      }
    });

    // Обработчик формы оплаты
    if (paymentForm) {
      paymentForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (cart.length === 0) {
          showNotification("Ваша корзина пуста!");
          return;
        }

        const paymentMethod = document.querySelector(
          'input[name="payment-method"]:checked'
        )?.value;
        if (!paymentMethod) {
          showNotification("Пожалуйста, выберите способ оплаты.");
          return;
        }

        // Сохраняем данные заказа перед очисткой корзины
        localStorage.setItem("completedOrder", JSON.stringify(cart));
        localStorage.setItem("paymentMethod", paymentMethod);
        showNotification(
          `Оплата ${
            paymentMethod === "cash" ? "наличными" : "картой"
          } подтверждена!`
        );

        // Очистка корзины
        cart = [];
        discountApplied = false;
        localStorage.setItem("pizzaCart", JSON.stringify(cart));
        localStorage.setItem(
          "pizzaDiscountApplied",
          JSON.stringify(discountApplied)
        );
        updateCartDisplay();

        // Перенаправление на страницу подтверждения
        setTimeout(() => {
          window.location.href = "confirm.html";
        }, 2000);
      });
    }

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
    updateCartDisplay();
    updateDeliveryInfo();
  } catch (error) {
    console.error("Ошибка в payment.js:", error);
  }
});
