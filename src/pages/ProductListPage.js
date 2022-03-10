import api from "../lib/api/index.js";
import productCache from "../lib/cache/productCache.js";
import formatMoney from "../lib/formatter/formatMoney.js";
import Component from "../lib/template/component.template.js";
import { router, routes } from "../router.js";

const defaultState = { products: [] };

class ProductListPage extends Component {
  handleClick;

  constructor({ $target }) {
    super({
      $target,
      initialState: { ...defaultState },
      className: "ProductListPage",
    });
    this.$node = document.createElement("div");

    this.handleClick = (e) => {
      if (!e.target instanceof Node) return;
      const $li = e.target.closest("li");
      if (!$li) return;
      const {
        dataset: { id },
      } = $li;
      if (id) {
        router.pushState(routes.productDetail, { params: id });
      }
    };
  }

  template() {
    const { products } = this.$state;
    return `
            <h1>상품목록</h1>
            <ul>
                ${products
                  .map(
                    ({ id, name, imageUrl, price }) => `
                        <li class="Product" data-id="${id}">
                            <img src=${imageUrl} />
                            <div class="Product__info">
                                <div>${name}</div>
                                <div>${formatMoney(price)}원~</div>
                            </div>
                        </li>
                        `
                  )
                  .join("")}
            </ul>
          `;
  }

  setEvent() {
    this.$node.querySelector("ul")?.addEventListener("click", this.handleClick);
  }
  clearEvent() {
    this.$node
      .querySelector("ul")
      ?.removeEventListener("click", this.handleClick);
  }

  afterMount() {
    if (productCache.list.length) {
      this.setState({ products: productCache.list });
      return;
    }
    api.getProductList().then((products) => {
      productCache.list = products;
      this.setState({ products });
    });
  }
}

export default ProductListPage;
