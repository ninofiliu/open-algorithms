import { Link, Route, Routes } from "react-router";
import "./main.css";
import { Pexcil } from "./pages/pexcil/pexcil";

export const App = () => {
  return (
    <div>
      <div
        style={{
          display: "flex",
          fontSize: "3rem",
          borderBottom: "1px solid var(--white)",
        }}
      >
        <Link to="/" style={{ padding: "1rem", flexGrow: 1 }}>
          Open Algorithms
        </Link>
      </div>
      <Routes>
        <Route
          path="/"
          element={
            <div style={{ padding: "1rem" }}>
              <p>
                Open Algorithms is a collection of visual art algorithms by{" "}
                <a href="https://ninofiliu.com">Nino Filiu</a> that run in the
                browser to process user-provided media (pictures, videos, or
                webcam stream) in order to glitch them or create interesting
                visuals.
              </p>
              <p>
                Everything is open sourced on{" "}
                <a href="https://github.com/ninofiliu/webart">Github</a>.
              </p>
              <p>
                <Link to="/pexcil">Pexcil</Link>: initially designed as an
                algorithm to realistically imitate the way I used my pencil to
                draw, was eventually deemed much more interesting when using
                unrealistic parameters.
              </p>
            </div>
          }
        />
        <Route path="/pexcil" element={<Pexcil />} />
      </Routes>
    </div>
  );
};
