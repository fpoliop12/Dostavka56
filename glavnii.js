document.addEventListener("DOMContentLoaded", () => {
  try {
    // Общие переменные
    const navLinks = document.querySelectorAll("nav a") || [];
    const contentSections = document.querySelectorAll(".content-section") || [];
    const loginModal = document.getElementById("loginModal");
    const registerModal = document.getElementById("registerModal");
    const cartModal = document.getElementById("cartModal");
    const closeButtons = document.querySelectorAll(".close-button") || [];
    const cartLinkSpan = document.querySelector(".cart-link span");
    const promoMessage = document.getElementById("promo-message");
    const cartItemsDiv = document.getElementById("cart-items");
    const cartTotalSpan = document.getElementById("cart-total");
    const cartSubtotalSpan = document.getElementById("cart-subtotal");
    const cartDiscountSpan = document.getElementById("cart-discount");
    const cartItemsCount = document.getElementById("cart-items-count");
    const promoCodeInput = document.getElementById("promo-code");
    const applyPromoButton = document.getElementById("apply-promo");
    const checkoutButton = document.getElementById("checkout-button");
    const checkoutSpinner = document.getElementById("checkout-spinner");
    const loginButton = document.querySelector(".login-button");
    const userInfo = document.getElementById("userInfo");
    const usernameDisplay = document.getElementById("usernameDisplay");
    const logoutButton = document.getElementById("logoutButton");

    let cart = JSON.parse(localStorage.getItem("pizzaCart")) || [];
    let cartTotal = cart.reduce((sum, item) => sum + item.price, 0) || 0;
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

    // Карусель
    const carousel = document.querySelector(".carousel");
    const slides = document.querySelectorAll(".slide") || [];
    const prevButton = document.querySelector(".carousel-button.prev");
    const nextButton = document.querySelector(".carousel-button.next");
    const dotsContainer = document.querySelector(".carousel-dots");
    let slideIndex = 0;

    if (dotsContainer && slides.length > 0) {
      slides.forEach((_, i) => {
        const dot = document.createElement("div");
        dot.classList.add("carousel-dot");
        if (i === 0) dot.classList.add("active");
        dot.addEventListener("click", () => {
          slideIndex = i;
          updateCarousel();
          resetCarouselInterval();
        });
        dotsContainer.appendChild(dot);
      });
    }

    const dots = document.querySelectorAll(".carousel-dot") || [];

    const updateCarousel = () => {
      if (carousel) {
        carousel.style.transform = `translateX(${-slideIndex * 100}%)`;
        dots.forEach((dot, i) => {
          dot.classList.toggle("active", i === slideIndex);
        });
      }
    };

    const nextSlide = () => {
      if (slides.length > 0) {
        slideIndex = (slideIndex + 1) % slides.length;
        updateCarousel();
      }
    };

    const prevSlide = () => {
      if (slides.length > 0) {
        slideIndex = (slideIndex - 1 + slides.length) % slides.length;
        updateCarousel();
      }
    };

    let carouselInterval = setInterval(nextSlide, 5000);

    const resetCarouselInterval = () => {
      clearInterval(carouselInterval);
      carouselInterval = setInterval(nextSlide, 5000);
    };

    // Модальные окна
    const openModal = (modalId) => {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.style.display = "flex";
        setTimeout(() => {
          modal.classList.add("show");
        }, 10);
        document.body.style.overflow = "hidden";
      }
    };

    const closeModal = (modalId) => {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove("show");
        setTimeout(() => {
          modal.style.display = "none";
        }, 300);
        document.body.style.overflow = "auto";
      }
    };

    window.addEventListener("click", (event) => {
      if (event.target === loginModal || event.target === cartModal) {
        closeModal(event.target.id);
      }
    });

    closeButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        const modal = button.closest(".modal");
        if (modal) closeModal(modal.id);
      });
    });

    // Корзина
    const updateCartLink = () => {
      if (cartLinkSpan) {
        cartLinkSpan.textContent = cart.length;
      }
    };

    const animateAddToCart = (productImage) => {
      const cartLink = document.querySelector(".cart-link");
      if (!cartLink) return;

      const img = document.createElement("img");
      img.src = productImage;
      img.classList.add("add-to-cart-animation");
      document.body.appendChild(img);

      const productButtonRect = event.target.getBoundingClientRect();
      const cartLinkRect = cartLink.getBoundingClientRect();

      img.style.position = "fixed";
      img.style.left = `${
        productButtonRect.left + productButtonRect.width / 2
      }px`;
      img.style.top = `${
        productButtonRect.top + productButtonRect.height / 2
      }px`;
      img.style.width = "50px";
      img.style.height = "50px";
      img.style.opacity = "1";
      img.style.borderRadius = "50%";
      img.style.objectFit = "cover";
      img.style.zIndex = "10000";
      img.style.pointerEvents = "none";
      img.style.transition = "all 0s";

      setTimeout(() => {
        img.style.transition = "all 0.8s cubic-bezier(.5,0,.5,1)";
        img.style.left = `${cartLinkRect.left + cartLinkRect.width / 2}px`;
        img.style.top = `${cartLinkRect.top + cartLinkRect.height / 2}px`;
        img.style.width = "20px";
        img.style.height = "20px";
        img.style.opacity = "0";
      }, 10);

      setTimeout(() => {
        img.remove();
      }, 800);
    };

    const updateCartModal = () => {
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
      localStorage.setItem(
        "pizzaDiscountApplied",
        JSON.stringify(discountApplied)
      );

      document.querySelectorAll(".remove-from-cart").forEach((button) => {
        button.addEventListener("click", () => {
          removeFromCart(parseInt(button.dataset.id));
        });
      });
    };

    const addToCart = (productName, productPrice, productImage) => {
      const product = {
        name: productName,
        price: productPrice,
        image: productImage,
        id: Date.now(),
      };

      cart.push(product);
      cartTotal += product.price;

      updateCartModal();
      updateCartLink();
      animateAddToCart(productImage);
    };

    const removeFromCart = (productId) => {
      const productToRemove = cart.find((item) => item.id === productId);
      if (productToRemove) {
        cart = cart.filter((item) => item.id !== productId);
        cartTotal -= productToRemove.price;
        updateCartModal();
        updateCartLink();
      }
    };

    const applyPromoCode = () => {
      if (!promoMessage || !promoCodeInput) return;

      promoMessage.textContent = "";
      promoMessage.className = "";

      if (promoCodeInput.value === "PIZZA20" && !discountApplied) {
        discountApplied = true;
        promoMessage.textContent = "Промокод применён! Ваша скидка 20%";
        promoMessage.classList.add("success");
        updateCartModal();
      } else if (discountApplied) {
        promoMessage.textContent = "Промокод уже был применён";
        promoMessage.classList.add("error");
      } else {
        promoMessage.textContent = "Неверный промокод";
        promoMessage.classList.add("error");
      }
    };

    // Обработчик регистрации
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
      registerForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const username = document.getElementById("regUsername")?.value;
        const email = document.getElementById("regEmail")?.value;
        const password = document.getElementById("regPassword")?.value;

        if (username && email && password) {
          localStorage.setItem("username", username);
          localStorage.setItem("email", email);
          localStorage.setItem("password", password);
          localStorage.setItem("isLoggedIn", "true");
          showNotification("Регистрация прошла успешно!");
          closeModal("registerModal");
          if (loginButton && userInfo && usernameDisplay) {
            loginButton.style.display = "none";
            userInfo.style.display = "flex";
            usernameDisplay.textContent = username;
          }
        } else {
          showNotification("Пожалуйста, заполните все поля.");
        }
      });
    }

    // Обработчик входа
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const username = document.getElementById("username")?.value;
        const password = document.getElementById("password")?.value;
        const savedUsername = localStorage.getItem("username");
        const savedPassword = localStorage.getItem("password");

        if (username === savedUsername && password === savedPassword) {
          localStorage.setItem("isLoggedIn", "true");
          showNotification("Вход выполнен успешно!");
          closeModal("loginModal");
          if (loginButton && userInfo && usernameDisplay) {
            loginButton.style.display = "none";
            userInfo.style.display = "flex";
            usernameDisplay.textContent = username;
          }
        } else {
          showNotification("Неверное имя пользователя или пароль.");
        }
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

    // Обработчики событий
    if (prevButton) {
      prevButton.addEventListener("click", () => {
        prevSlide();
        resetCarouselInterval();
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", () => {
        nextSlide();
        resetCarouselInterval();
      });
    }

    navLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const target = link.dataset.target;

        contentSections.forEach((section) => {
          section.classList.remove("active");
        });

        const targetSection = document.getElementById(target);
        if (targetSection) {
          targetSection.classList.add("active");
          targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (target === "cart") {
          openModal("cartModal");
        }
      });
    });

    if (loginButton) {
      loginButton.addEventListener("click", (event) => {
        event.preventDefault();
        openModal("loginModal");
      });
    }

    const contactButton = document.querySelector(".contact-button");
    if (contactButton) {
      contactButton.addEventListener("click", (event) => {
        event.preventDefault();
        const contactsSection = document.getElementById("contacts");
        if (contactsSection) {
          contactsSection.scrollIntoView({ behavior: "smooth" });
        }
      });
    }

    const cartLink = document.querySelector(".cart-link a");
    if (cartLink) {
      cartLink.addEventListener("click", (event) => {
        event.preventDefault();
        openModal("cartModal");
      });
    }

    const openRegisterModal = document.getElementById("openRegisterModal");
    if (openRegisterModal) {
      openRegisterModal.addEventListener("click", (event) => {
        event.preventDefault();
        closeModal("loginModal");
        openModal("registerModal");
      });
    }

    const addToCartButtons = document.querySelectorAll(".add-to-cart") || [];
    addToCartButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
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

    if (applyPromoButton) {
      applyPromoButton.addEventListener("click", (event) => {
        event.preventDefault();
        applyPromoCode();
      });
    }

    if (checkoutButton) {
      checkoutButton.addEventListener("click", (event) => {
        if (cart.length === 0) {
          event.preventDefault();
          if (promoMessage) {
            promoMessage.textContent = "Добавьте товары в корзину";
            promoMessage.className = "error";
          }
          return;
        }

        if (checkoutSpinner) {
          checkoutSpinner.style.display = "inline-block";
          setTimeout(() => {
            checkoutSpinner.style.display = "none";
          }, 2000);
        }
      });
    }

    // Инициализация
    updateCartModal();
    updateCartLink();
    updateCarousel();
    setTimeout(() => {
      const activeSection = document.querySelector(".content-section.active");
      if (activeSection) {
        activeSection.classList.add("animate__animated", "animate__fadeIn");
      }
    }, 500);
  } catch (error) {
    console.error("Ошибка в glavnii.js:", error);
  }
});
// Инициализация карты
function initMap() {
  // Проверяем, что карта ещё не инициализирована
  if (
    document.getElementById("map") &&
    !document.getElementById("map").hasChildNodes()
  ) {
    ymaps.ready(() => {
      // Создаём карту
      const map = new ymaps.Map("map", {
        center: [51.7687, 55.1157], // Примерные координаты Оренбурга
        zoom: 15,
        controls: ["zoomControl"],
      });

      // Геокодируем адрес "Оренбург, Волгоградская 20"
      ymaps
        .geocode("Оренбург, Волгоградская 20", { results: 1 })
        .then((res) => {
          const geoObject = res.geoObjects.get(0);
          if (geoObject) {
            const coords = geoObject.geometry.getCoordinates();
            // Устанавливаем центр карты на найденные координаты
            map.setCenter(coords);

            // Добавляем метку
            const placemark = new ymaps.Placemark(
              coords,
              {
                hintContent: "Pizza Bar",
                balloonContent: "Pizza Bar<br>Оренбург, Волгоградская 20",
              },
              {
                preset: "islands#redDotIcon",
              }
            );
            map.geoObjects.add(placemark);
          } else {
            showNotification("Не удалось найти адрес для карты.");
          }
        })
        .catch((error) => {
          console.error("Ошибка геокодирования:", error);
          showNotification("Ошибка загрузки карты.");
        });
    });
  }
}

// Инициализация карты при открытии секции контактов
navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target =
      link.getAttribute("data-target") ||
      link.getAttribute("href").replace(".html", "");
    if (target === "zakaz") {
      window.location.href = "zakaz.html";
    } else {
      showSection(target);
      // Инициализация карты при открытии секции контактов
      if (target === "contacts") {
        initMap();
      }
    }
  });
});

// Инициализация карты, если страница загрузилась с активной секцией контактов
if (document.querySelector(".content-section.active")?.id === "contacts") {
  initMap();
}
