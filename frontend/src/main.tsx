import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import { router } from "./routes/app-route.tsx";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { fetchCurrentUser } from "./redux/slices/authSlice";

store.dispatch(fetchCurrentUser());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);
