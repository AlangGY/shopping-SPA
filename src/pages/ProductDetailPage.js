import api from "../lib/api/index.js";
import productCache from "../lib/cache/productCache.js";
import constants from "../lib/constants.js";
import formatMoney from "../lib/formatter/formatMoney.js";
import storage from "../lib/storage/localStorage.js";
import Component from "../lib/template/component.template.js";
import { router, routes } from "../router.js";

const defaultState = {
  product: null,
  id: null,
  selectedOptions: [],
  isLoading: false,
};

class ProductDetailPage extends Component {
  #isInit = true;

  constructor({ $target, initialState }) {
    super({
      $target,
      initialState: { ...defaultState, ...initialState },
      className: "ProductDetailPage",
    });
    this.$node = document.createElement("div");

    this.handleSelect = (e) => {
      const selectedId = Number(e.target.value);
      const { product, selectedOptions } = this.$state;
      const isSelected = !!selectedOptions.find(
        (selectedOption) => selectedOption.id === selectedId
      );
      const $select = this.$node.querySelector("select");
      if ($select) {
        $select.value = "-1";
      }
      if (isSelected) {
        return;
      }
      const newSelectedOption = product.productOptions.find(
        (productOption) => productOption.id === selectedId
      );
      if (!newSelectedOption) {
        console.error(`${selectedId} id인 옵션이 없습니다!`);
        return;
      }
      newSelectedOption.value = 1;

      this.setState({
        selectedOptions: [...selectedOptions, newSelectedOption],
      });
    };

    this.handleInput = (e) => {
      if (e.target.nodeName !== "INPUT" && e.target.type === "number") return;
      let newValue = Number(e.target.value);
      const $li = e.target.closest("li");
      if (!$li) return;
      if ($li.dataset.id) {
        const id = Number($li.dataset.id);
        const newSelectedOptions = this.$state.selectedOptions.map(
          (selectedOption) => {
            const copyOption = { ...selectedOption };
            if (copyOption.id === id) {
              if (copyOption.stock < newValue) {
                newValue = copyOption.stock;
                e.target.value = newValue;
              }
              copyOption.value = newValue;
            }
            return copyOption;
          }
        );
        this.setState({ selectedOptions: newSelectedOptions });
      }
    };

    this.handleToCart = () => {
      const { selectedOptions, product } = this.$state;
      const cart = storage.getItem(constants.CART_STORAGE_KEY, []);
      selectedOptions.forEach((selectedOption) => {
        const cartIndex = cart.findIndex(
          ({ productId, optionId }) =>
            productId === product.id && optionId === selectedOption.id
        );
        if (cartIndex >= 0) {
          cart[cartIndex].quantity = selectedOption.value;
        } else {
          cart.push({
            productId: product.id,
            optionId: selectedOption.id,
            quantity: selectedOption.value,
          });
        }
      });
      storage.setItem(constants.CART_STORAGE_KEY, cart);
      router.pushState(routes.cart);
    };
  }

  template() {
    const { product, id, selectedOptions, isLoading } = this.$state;
    if (isLoading) return "Loading";
    if (!product) return "상품 정보를 불러오는데 실패하였습니다.";
    if (!this.#isInit) return;
    this.#isInit = false;
    return `
            ${`
                    <h1>${product.name} 상품 정보</h1>
                    <div class=""ProductDetail>
                        <img src="${product.imageUrl}"/>
                        <div class="ProductDetail__info">
                            <h2>${product.name}</h2>
                            <div class="ProductDetail__price">${formatMoney(
                              product.price
                            )}원~</div>
                            <select>
                                <option value="-1">선택하세요.</option>
                                ${product.productOptions.map(
                                  ({
                                    id: optionId,
                                    name: optionName,
                                    price: optionPrice,
                                    stock: optionStock,
                                  }) => {
                                    if (optionStock === 0) {
                                      return `
                                            <option disabled>(품절) ${product.name} ${optionName}</option>
                                        `;
                                    }
                                    if (optionPrice === 0) {
                                      return `
                                            <option value=${optionId}>${product.name} ${optionName}</option>
                                        `;
                                    }
                                    return `
                                        <option value=${optionId}>${
                                      product.name
                                    } ${optionName} (+${formatMoney(
                                      optionPrice
                                    )}원)</option>
                                    `;
                                  }
                                )}
                            </select>
                        </div>
                        <div class="ProductDetail__selectedOptions">
                                <h3>선택된 상품</h3>
                                <ul>
                                    ${selectedOptions
                                      .map((selectedOption) => {
                                        return `
                                            <li data-id=${selectedOption.id}>
                                                ${product.name} ${
                                          selectedOption.name
                                        } ${formatMoney(
                                          product.price + selectedOption.price
                                        )}원
                                                <div><input type="number" value="${
                                                  selectedOption.value || 0
                                                }" min="0" max="${
                                          selectedOption.stock
                                        }" />개</div>
                                            </li>
                                        `;
                                      })
                                      .join("")}
                                </ul>
                        </div>
                        <div class="ProductDetail__totalPrice">
                            ${formatMoney(
                              selectedOptions.reduce(
                                (totalPrice, selectedOption) =>
                                  totalPrice +
                                  (product.price + selectedOption.price) *
                                    selectedOption.value,
                                0
                              ) || 0
                            )}원
                        </div>
                        <button class="OrderButton">주문하기</button>
                    </div>
                  `}
        `;
  }

  afterRender() {
    const { product, selectedOptions } = this.$state;
    const $selectedOptionsUl = this.$node
      .querySelector(".ProductDetail__selectedOptions")
      ?.querySelector("ul");
    const $totalPriceDiv = this.$node.querySelector(
      ".ProductDetail__totalPrice"
    );
    if (!$selectedOptionsUl || !$totalPriceDiv) return;
    // totalPrice
    $totalPriceDiv.textContent = `${formatMoney(
      selectedOptions.reduce((totalPrice, selectedOption) => {
        return (
          totalPrice +
          (product.price + selectedOption.price) * selectedOption.value
        );
      }, 0) || 0
    )}원`;
    // selectedOption
    const $selectedOptionsLis = $selectedOptionsUl.querySelectorAll("li");
    selectedOptions
      .filter(
        (selectedOption) =>
          ![...$selectedOptionsLis]?.find(
            ($selectedOptionLi) =>
              Number($selectedOptionLi.dataset.id) === selectedOption.id
          )
      )
      .forEach((selectedOption) => {
        const $li = document.createElement("li");
        $li.dataset.id = selectedOption.id;
        $li.innerHTML = `
          ${product.name} ${selectedOption.name} ${formatMoney(
          product.price + selectedOption.price
        )}원
          <div><input type="number" min="0" max="${
            selectedOption.stock
          }" value="${selectedOption.value || 0}" />개</div>
          `;
        $selectedOptionsUl.appendChild($li);
      });
  }

  setEvent() {
    this.$node
      .querySelector("select")
      ?.addEventListener("change", this.handleSelect);
    this.$node
      .querySelector(".ProductDetail__selectedOptions")
      ?.addEventListener("input", this.handleInput);
    this.$node
      .querySelector(".OrderButton")
      ?.addEventListener("click", this.handleToCart);
  }
  clearEvent() {
    this.$node
      .querySelector("select")
      ?.removeEventListener("change", this.handleSelect);
    this.$node
      .querySelector(".ProductDetail__selectedOptions")
      ?.removeEventListener("input", this.handleInput);
    this.$node
      .querySelector(".OrderButton")
      ?.removeEventListener("click", this.handleToCart);
  }

  beforeMount() {
    this.#isInit = true;
  }

  afterMount() {
    if (!this.$state.id) {
      const params = location.pathname.split("/").pop();
      if (params) {
        this.setState({ id: params });
      }
    }
    const { id } = this.$state;
    (async () => {
      let product;
      if (productCache.detail[id]) {
        product = productCache.detail[id];
      } else {
        this.setState({ isLoading: true });
        product = await api.getProductDetail(id);
        productCache.detail[id] = product;
      }
      const selectedOptions = storage
        .getItem(constants.CART_STORAGE_KEY, [])
        .filter(({ productId }) => productId === product.id)
        .map(({ optionId, quantity }) => {
          const selectedOption = product.productOptions.find(
            (productOption) => productOption.id === optionId
          );
          return { ...selectedOption, value: quantity };
        });
      this.setState({ product, selectedOptions, isLoading: false });
    })();
  }
}

export default ProductDetailPage;
