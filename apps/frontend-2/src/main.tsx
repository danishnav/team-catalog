import "@navikt/ds-css";
import "@navikt/ds-css-internal";
import "./designSystemOverrides.css";

import { ApolloProvider } from "@apollo/client";
import { css } from "@emotion/css";
import type { ReactNode } from "react";
import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";

import { apolloClient } from "./api/nom/apolloclient";
import { BetaBanner } from "./components/BetaBanner";
import Header, { headerHeigth } from "./components/Header";
import MainRoutes from "./routes";
import Footer, { footerHeigth } from "./components/Footer";

const queryClient = new QueryClient();

const Main = () => {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <ApolloProvider client={apolloClient}>
          <QueryClientProvider client={queryClient}>
            <CenteredContentContainer>
              <Header />
              <BetaBanner />
              <MainRoutes />
            </CenteredContentContainer>
            <Footer />
          </QueryClientProvider>
        </ApolloProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
};

function CenteredContentContainer({ children }: { children: ReactNode }) {
  return (
    <div
      className={css`
        width: 100%;
        display: flex;
        justify-content: center;
        overflow-x: clip;
        /* 100px under er testet frem til, dette hende dette må endres ved endringer på header eller footer */
        min-height: calc(100vh - ${headerHeigth} - ${footerHeigth} + 100px);
      `}
    >
      <div
        className={css`
          width: 1400px;
          margin: 0 75px 75px;
        `}
      >
        {children}
      </div>
    </div>
  );
}

const container = document.querySelector("#root");
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);

root.render(<Main />);
