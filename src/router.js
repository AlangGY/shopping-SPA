export const routes = {
  productList: "/web/",
  productDetail: "/web/products/",
  cart: "/web/cart/",
};

export const router = {
  pushState: (url, options = {}) => {
    const { query, params } = options;
    const queryString = Object.keys(query || {})
      .map((key) => `${key}=${query[key]}`)
      .join("&");
    history.pushState(
      "",
      "",
      `${url}${params || ""}${queryString ? `?${queryString}` : ""}`
    );
    dispatchRouteChange(url, { query, params });
  },
};

export const dispatchRouteChange = (url, { query, params }) => {
  const routeChangeEvent = new CustomEvent("route-change", {
    detail: { url, query, params },
  });
  dispatchEvent(routeChangeEvent);
};
