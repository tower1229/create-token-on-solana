import "./App.css";
import {
  createRouter,
  RouterProvider,
  createHashHistory,
} from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";
import { SolanaProvider } from "@/components";

import { Toaster } from "react-hot-toast";

// Set up a Router instance
const hashHistory = createHashHistory();
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  history: hashHistory,
});

// Register things for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// 注册所有获取函数
import { getStore } from "@/store";
import { fetchFunctions } from "@/store/modules/fetchFunctions";

getStore().DataStore.registerAll(fetchFunctions);
getStore().DataStore.preloadAll([
  "rules",
  "personFilterTypes",
  "distributionMethods",
]);

const App = () => {
  return (
    <SolanaProvider>
      <RouterProvider router={router} />
      <Toaster />
    </SolanaProvider>
  );
};

export default App;
