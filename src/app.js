import { routes } from "./router.js";
import Component from "./lib/template/component.template.js";
import ProductListPage from "./pages/ProductListPage.js";
import ProductDetailPage from "./pages/ProductDetailPage.js";
import CartPage from "./pages/CartPage.js";

class App extends Component {
  constructor({ $target, initialState }) {
    super({ $target, initialState });
    this.$node = $target;

    this.routeChange = (e) => {
      const {
        detail: { url, query, params },
      } = e;
      this.unMount();
      this.$children.clear();
      switch (url) {
        case routes.productList:
          this.$children.set(
            "productListPage",
            new ProductListPage({ $target })
          );
          break;
        case routes.productDetail:
          this.$children.set(
            "productDetailPage",
            new ProductDetailPage({ $target, initialState: { id: params } })
          );
          break;
        case routes.cart:
          this.$children.set("cartPage", new CartPage({ $target }));
        default:
          // this.$children.set('404Page', new ErrorPage({$target}));
          break;
      }
      this.mount();
    };
  }

  setEvent() {
    window.addEventListener("route-change", this.routeChange);
  }

  clearEvent() {
    window.removeEventListener("route-change", this.routeChange);
  }
}

export default App;
