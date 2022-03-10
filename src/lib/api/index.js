import mock from "../mock.js";

const api = {
  getProductList: async () => {
    // const products = await request("/products");
    const products = mock.PRODUCT_LIST;
    return products;
  },
  getProductDetail: async (id) => {
    // const detail = await request("/products/${id}")
    const detail = mock.PRODUCT_DETAIL[id];
    return detail;
  },
};

const request = async (url) => {
  try {
    const data = await fetch(`${API_ENDPOINT}${url}`).then((res) => res.json());
    if (data) {
      return data;
    }
    throw new Error("no Data");
  } catch (e) {
    console.error("request Failed!", e);
  }
};

export default api;
