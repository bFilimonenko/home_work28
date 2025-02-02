let selectedProduct;
let order = [];

document.addEventListener("DOMContentLoaded", () => {
  showCategories();
});

document.querySelector(".categories").addEventListener("click", (event) => {
  if (
    event.target.tagName === "DIV" &&
    event.target.classList.contains("category")
  ) {
    document.querySelector(".product_info").innerHTML = "";

    const categoryId = event.target.getAttribute("data-id");

    document.querySelector(".products").setAttribute("data-category-id", categoryId);

    showProductsByCategory(categoryId);
  }
});

document.querySelector(".products").addEventListener("click", (event) => {
  if (
    event.target.tagName === "DIV" &&
    event.target.classList.contains("product")
  ) {
    const selectedCategoryId = event.target.parentNode.getAttribute("data-category-id");
    const productId = event.target.getAttribute("data-id");

    const selectedCategory = categories.find(category => category.id === selectedCategoryId);

    selectedProduct = selectedCategory.items.find(item => item.id === productId);
    showProductInfo(selectedProduct);
  }
});

document.querySelector(".order-btn").addEventListener("click", showOrderForm);

document.querySelector(".background").addEventListener("click", () => {
  document.querySelector(".order_form").classList.add("hidden");
  document.querySelector(".background").classList.add("hidden");
});

function showCategories() {
  showEntities(".categories", "category", categories);
}

function showProductsByCategory(categoryId) {
  const myCategory = categories.find((category) => category.id === categoryId);
  const products = myCategory.items;
  showEntities(".products", "product", products);
}

//Output of objects to the page
function showEntities(
  parentSelector,
  elementClassName,
  entities
) {
  const parentElement = document.querySelector(parentSelector);
  parentElement.innerHTML = "";

  for (let entity of entities) {
    const element = document.createElement("div");
    // element.textContent = entity.name;
    element.classList.add(elementClassName);
    element.setAttribute("data-id", entity.id);
    element.innerHTML = `<h2>${entity.name}</h2>`;

    parentElement.appendChild(element);
  }
}

function addProductToOrder(selectedProduct, quantity) {
  const existingProduct = order.find(item => item.product === selectedProduct.name);

  if (existingProduct) {
    existingProduct.amount += quantity;
  } else {
    order.push({
      product: selectedProduct.name,
      price: selectedProduct.price,
      amount: quantity
    });
  }

  //add product to html
}

function initializeReceipt() {
  const receipt = document.querySelector(".receipt");

  order.forEach(product => {
    const item = document.createElement("div");
    item.innerHTML = `
    <h3>${product.product}</h3>
    <p>$ ${product.price}</p>
    <span>${product.amount}</span>
    `;

    receipt.appendChild(item);
  });
}

function autocalculation(order) {
  const result = order.reduce((accumulator, currentValue) => accumulator + (currentValue.price * currentValue.amount),
    0);
  document.getElementById("autocalculation").textContent = `$${result}`;
}

function showProductInfo(product) {
  if (!product) {
    return;
  }

  const parent = document.querySelector(".product_info");

  parent.innerHTML = `
    <div class="product_info_list">
    <h2>${product.name}</h2>
    <p>$${product.price}</p>
    <p>${product.description}</p>
    <div class="wrapper">
    <span class="minus">-</span>
    <span class="num">1</span>
    <span class="plus">+</span>
    </div>
    <button type="button">Придбати</button>
    </div>
  `;

  parent.innerHTML += generateSliderLayout();
  initializeSlider(product.images);

  //Product quantity
  let quantity = 1;

  document.querySelector(".plus").addEventListener("click", () => {
    document.querySelector(".num").innerText = ++quantity;
  });
  document.querySelector(".minus").addEventListener("click", () => {
    if (quantity > 1) {
      document.querySelector(".num").innerText = --quantity;
    }
  });

  const buyBtn = document.querySelector(".product_info .product_info_list button");
  buyBtn.addEventListener("click", () => {

    const label = document.querySelector(".amount");
    const digit = parseInt(label.textContent);
    label.innerHTML = `${digit + quantity}`;

    addProductToOrder(selectedProduct, quantity);
  });
}

function renderOptions(inputName, options) {
  const input = document.getElementsByName(inputName)[0];
  input.innerHTML = `<option value="-1">Select your ${inputName}</option>`;

  options.forEach(option => {
    const selectionElement = document.createElement("option");
    selectionElement.textContent = option.label;
    selectionElement.value = option.id;

    input.appendChild(selectionElement);
  });
  return input;
}

async function showOrderForm() {
  initializeReceipt();
  autocalculation(order);

  document.querySelector(".order_form").classList.remove("hidden");
  document.querySelector(".background").classList.remove("hidden");

  const novaPostService = new NovaPostService();
  const regions = await novaPostService.getRegions();

  const regionInput = renderOptions("region", regions);
  const cityInput = renderOptions("city", novaPostService.currentCities);
  //warehouseInput
  renderOptions("warehouse", novaPostService.currentWarehouses);

  regionInput.addEventListener("change", (event) => {
    novaPostService.getCitiesByRegion(event.target.value, (param) => renderOptions("city", param));
  });
  cityInput.addEventListener("change", (event) => {
    console.log(event.target.value);
    novaPostService.getWarehouseByCity(event.target.value, (param) => renderOptions("warehouse", param));
  });
}

document.querySelector("#finishOrder").addEventListener("click", (event) => {
  const name = document.forms.order.name.value.trim();
  const phone = document.forms.order.phone.value.trim();
  const region = document.forms.order.region.selectedOptions[0].label;
  const city = document.forms.order.city.selectedOptions[0].label;
  const warehouse = document.forms.order.warehouse.selectedOptions[0].label;

  if (order.length === 0) {
    showWarningNotification("Your cart is empty");
    return;
  }

  if (
    !name ||
    !phone ||
    isNaN(parseInt(phone)) ||
    phone.length < 13 ||
    region === "Select your region" ||
    city === "Select your city" ||
    warehouse === "Select your warehouse"
  ) {
    showWarningNotification("Please fill in all fields correctly");
    return;
  }

  const clientData = {
    name: name,
    phone: phone,
    region: region,
    city: city,
    warehouse: warehouse
  };

  localStorage.setItem("clientData", JSON.stringify(clientData));

  showSuccessNotification();
});

function showWarningNotification(message) {
  const notification = document.querySelector(".notification.warning");

  notification.textContent = message;
  notification.classList.remove("hidden");
  setTimeout(() => {
    notification.classList.add("hidden");
  }, 2000);
}

function showSuccessNotification() {
  const notification = document.querySelector(".notification.success");

  notification.textContent = "Congrats! You bought product";
  notification.classList.remove("hidden");

  setTimeout(() => {
    notification.classList.add("hidden");
    document.querySelector(".order_form").classList.add("hidden");
    document.querySelector(".background").classList.add("hidden");
  }, 3000);
}


