import * as React from "react";
import { ProvideAuth, PrivateRoute } from  "../context/user"
import { Header } from "../template/Header"
import { Footer } from "./Footer";

import { Home } from "../views/home"
import { UserIndex } from "../views/login";

import { GameList } from "../views/game/game-list";
import { CreateGame } from "../views/game/create-game";
import { GameLobby } from "../views/game/game-lobby";

import { Page404 } from "../views/404";


import {
  BrowserRouter,
  Routes,
  Route,
  Outlet
} from "react-router-dom";



export function IndexView(){
  return (
    <ProvideAuth>
      <BrowserRouter>
        <div style={{display: "flex", height: "100%", flexDirection: "column" }}>
          <Header />
          <div style={{ flexGrow: 1}}>
            <Routes>
              <Route
                path="/"
                element={<Home />}
              />
              <Route
                path="/login"
                element={<UserIndex />}
              />
              <Route
                path="/game-lobby"
                element={<Outlet />}
              >
                <Route
                  index
                  element={<GameList />}
                />
                <Route
                  path="create"
                  element={<CreateGame />}
                />
                <Route
                  path=":gameLobbyId"
                  element={<GameLobby />}
                />
              </Route>
              <Route
                path="*"
                element={<Page404 />}
              />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </ProvideAuth>
  )
}
