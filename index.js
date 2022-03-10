import App from "./src/app.js";

const $app = document.querySelector(".App");
const app = new App({ $target: $app }).mount();

const init = () => {
  const { pathname } = location;
  const pathnameSplitted = pathname.split("/");
  const params = pathnameSplitted.pop();
  const url = pathnameSplitted.join("/") + "/";
  const query = { ...new URL(document.location).searchParams };
  const routeChangeEvent = new CustomEvent("route-change", {
    detail: {
      url,
      query,
      params,
    },
  });
  dispatchEvent(routeChangeEvent);
};

init();
