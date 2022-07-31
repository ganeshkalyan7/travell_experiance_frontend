import "./App.css";
import { useState, useEffect } from "react";
import Map, { Marker, Popup } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import RoomIcon from "@mui/icons-material/Room";
import StarIcon from "@mui/icons-material/Star";
import axios from "axios";
import { format } from "timeago.js";
import Register from "./components/Register";
import Login from "./components/Login";

function App() {
  const [viewport, setViewport] = useState({
    latitude: 34.209515,
    longitude: 77.615112,
    zoom: 4,
  });
  const myStorage = window.localStorage;
  const [currentUser, setCurrentUser] = useState(myStorage.getItem("user"));

  const [pins, setPins] = useState([]);
  const [currentPlaceId, setCurrentPlaceId] = useState(null);
  const [newPlace, setNewPlace] = useState(null);
  const [title, setTitle] = useState(null);
  const [desc, setDesc] = useState(null);
  const [star, setStar] = useState(0);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  //getting pinsData
  useEffect(() => {
    const getPins = async () => {
      try {
        const allPins = await axios.get(
          "https://travellexperianceapplication.herokuapp.com/pins/get"
        );
        setPins(allPins.data);
      } catch (err) {
        console.log(err);
      }
    };
    getPins();
  }, []);

  const handleMarkerClick = (id, lat, long) => {
    setCurrentPlaceId(id);
    setViewport({ ...viewport, latitude: lat, longitude: long });
  };
  // console.log(pins);
  // console.log(currentPlaceId);
  const handleAddClick = (e) => {
    // console.log(e.lngLat.lat);
    // console.log(e.lngLat.lng);
    const latitude = e.lngLat.lat;
    const longitude = e.lngLat.lng;
    setNewPlace({
      lat: latitude,
      long: longitude,
    });
  };
  // console.log(newPlace);

  //creating new place
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPin = {
      username: currentUser,
      title,
      desc,
      rating: star,
      lat: newPlace.lat,
      long: newPlace.long,
    };

    try {
      const res = await axios.post(
        "https://travellexperianceapplication.herokuapp.com/pins/create",
        newPin
      );
      setPins([...pins, res.data]);
      setNewPlace(null);
    } catch (err) {
      console.log(err);
    }
  };
  //logout
  const handleLogout = () => {
    setCurrentUser(null);
    myStorage.removeItem("user");
  };

  return (
    <div className="App">
      <Map
        mapboxAccessToken="pk.eyJ1IjoiZ2FuZXNoa2FseWFuIiwiYSI6ImNsNjZtMnBoMTE4ZWkzZHA0OHVnejE4dm8ifQ.MoC5XKlxJqx4cA8Ev7VUSQ"
        initialViewState={{
          longitude: viewport.longitude,
          latitude: viewport.latitude,
          zoom: 4,
        }}
        transitionDuration="500"
        onDblClick={handleAddClick}
        style={{ width: "100%", height: "100vh" }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
      >
        {pins.map((p) => (
          <>
            <div key={p._id}>
              <Marker
                latitude={p.lat}
                longitude={p.long}
                offsetLeft={-3.5 * viewport.zoom}
                offsetTop={-7 * viewport.zoom}
                // color="#b40219"
                // color={p.username === currentUser ? "#b40219" : "black"}
                // fontSize={viewport.zomm * 10}
                // style={{
                //   fontSize: 7 * viewport.zoom,
                //   color: currentUser === p.username ? "tomato" : "slateblue",
                //   cursor: "pointer",
                // }}
                // onClick={() => handleMarkerClick(p._id, p.lat, p.long)}
              >
                <RoomIcon
                  style={{
                    fontSize: viewport.zomm * 10,
                    color: p.username === currentUser ? "tomato" : "black",
                  }}
                  onClick={() => handleMarkerClick(p._id, p.lat, p.long)}
                />
              </Marker>
              {p._id === currentPlaceId && (
                <Popup
                  key={p._id}
                  longitude={p.long}
                  latitude={p.lat}
                  closeButton={true}
                  closeOnClick={false}
                  anchor="left"
                  onClose={() => setCurrentPlaceId(null)}
                >
                  <div className="card">
                    <label>place</label>
                    <h4 className="place">{p.title}</h4>
                    <label>review</label>
                    <p className="desc">{p.desc}</p>
                    <label>rating</label>
                    <div className="stars">
                      {/* {p.rating} */}
                      {Array(p.rating).fill(<StarIcon className="star" />)}
                    </div>
                    <label>info</label>
                    <span className="username">
                      Created by <b>{p.username}</b>
                    </span>
                    <span className="date">{format(p.createdAt)}</span>
                  </div>
                </Popup>
              )}
            </div>
          </>
        ))}
        {newPlace && (
          <Popup
            longitude={newPlace.long}
            latitude={newPlace.lat}
            closeButton={true}
            closeOnClick={false}
            anchor="left"
            onClose={() => setCurrentPlaceId(null)}
          >
            <form onSubmit={handleSubmit}>
              <label>Title</label>
              <input
                placeholder="Enter a place name"
                autoFocus
                onChange={(e) => setTitle(e.target.value)}
              />
              <label>Description</label>
              <textarea
                placeholder="mention your experiance in that palce."
                onChange={(e) => setDesc(e.target.value)}
              />
              <label>Rating</label>
              <select onChange={(e) => setStar(e.target.value)}>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
              <button type="submit" className="submitButton">
                Add Pin
              </button>
            </form>
          </Popup>
        )}

        {currentUser ? (
          <button className="button logout" onClick={handleLogout}>
            Log out
          </button>
        ) : (
          <div className="buttons">
            <button className="button login" onClick={() => setShowLogin(true)}>
              Log in
            </button>
            <button
              className="button register"
              onClick={() => setShowRegister(true)}
            >
              Register
            </button>
          </div>
        )}

        {showRegister && <Register setShowRegister={setShowRegister} />}
        {showLogin && (
          <Login
            setShowLogin={setShowLogin}
            setCurrentUser={setCurrentUser}
            myStorage={myStorage}
          />
        )}
      </Map>
    </div>
  );
}

export default App;
