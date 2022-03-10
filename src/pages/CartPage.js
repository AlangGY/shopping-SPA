import api from "../lib/api/index.js";
import productCache from "../lib/cache/productCache.js";
import constants from "../lib/constants.js";
import formatMoney from "../lib/formatter/formatMoney.js";
import storage from "../lib/storage/localStorage.js";
import Component from "../lib/template/component.template.js";
import { router, routes } from "../router.js";

const defaultState = {
  selectedProducts: [],
  isLoading: false,
};

class CartPage extends Component {
  constructor({ $target, initialState }) {
    super({
      $target,
      initialState: { ...defaultState, ...initialState },
      className: "CartPage",
    });
    this.$node = document.createElement("div");

    this.handleOrder = () => {
      alert("주문되었습니다.");
      storage.clearItem(constants.CART_STORAGE_KEY);
      router.pushState(routes.productList);
    };
  }

  template() {
    const { selectedProducts, isLoading } = this.$state;
    return `
            <h1>장바구니</h1>
            <div class="Cart">
            ${
              isLoading
                ? "Loading..."
                : `
                    <ul>
                        ${selectedProducts
                          .map(
                            (selectedProduct) => `
                                <li class="Cart__item">
                                    <img src="${selectedProduct.imageUrl}" />
                                    <div class="Cart__itemDescription">
                                        <div>${selectedProduct.name} ${
                              selectedProduct.optionName
                            } ${formatMoney(selectedProduct.price)}원 ${
                              selectedProduct.quantity
                            }개</div>
                                        <div>${formatMoney(
                                          selectedProduct.price *
                                            selectedProduct.quantity
                                        )}원</div>
                                    </div>
                                </li>
                            `
                          )
                          .join("")}
                    </ul>
                    <div class="Cart__totalPrice">
                        총 상품가격 ${formatMoney(
                          selectedProducts.reduce(
                            (totalCost, selectedProduct) =>
                              totalCost +
                              selectedProduct.price * selectedProduct.quantity,
                            0
                          ) || 0
                        )}원
                    </div>
                    <button class="OrderButton">주문하기</button>
                    `
            }
            </div>
        `;
  }

  afterMount() {
    // imageUrl, name, optionName, price, quantity
    this.setState({ isLoading: true });
    const selectedProductsIds = storage.getItem(constants.CART_STORAGE_KEY, []);
    if (!selectedProductsIds.length) {
      setTimeout(() => {
        alert("장바구니가 비어 있습니다");
        router.pushState(routes.productList);
      }, 0);
      return;
    }
    Promise.all(
      selectedProductsIds.map(async ({ productId, optionId, quantity }) => {
        let product;
        // Cache
        if (productCache.detail[productId]) {
          product = productCache.detail[productId];
        } else {
          product = await api.getProductDetail(productId);
          productCache.detail[productId] = product;
        }
        const { imageUrl, name, price, productOptions } = product;
        const { name: optionName, price: optionPrice } = productOptions.find(
          (productOption) => productOption.id === optionId
        );
        return {
          imageUrl,
          name,
          optionName,
          price: price + optionPrice,
          quantity,
        };
      })
    ).then((selectedProducts) =>
      this.setState({ selectedProducts, isLoading: false })
    );
  }

  setEvent() {
    this.$node
      .querySelector("button")
      ?.addEventListener("click", this.handleOrder);
  }
  clearEvent() {
    this.$node
      .querySelector("button")
      ?.addEventListener("click", this.handleOrder);
  }
}

export default CartPage;
