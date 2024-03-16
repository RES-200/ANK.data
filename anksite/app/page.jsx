"use client";
import "./styles.css";
import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";
import React, { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Typed from "typed.js";
import L from "leaflet";
import { Table } from "react-bootstrap";
import lion from "./lion.jpg";
import Image from "next/image";

const SUPABASE_URL = "https://xzesgzaoewbtbiivxcal.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6ZXNnemFvZXdidGJpaXZ4Y2FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA1MjE3ODksImV4cCI6MjAyNjA5Nzc4OX0.D5II1tvD3grGOoNwMkDsibaFBR1TvitYz5J5b8RIi7k";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const Map = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

const page = () => {
  const el = useRef(null);

  const [data, setData] = useState([]);
  const [position, setPosition] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [data2, setData2] = useState([]);
  const [position2, setPosition2] = useState(null);
  const [markers2, setMarkers2] = useState([]);
  const [data3, setData3] = useState([]);
  const [rankingData, setRankingData] = useState([]);

  // const icon = L.icon({
  //   iconUrl:
  //     "https://www.clipartmax.com/png/small/1-10350_location-map-marker-pin-clipart-google-map-icon-white.png",
  //   iconSize: [25, 41], // size of the icon
  // });
  const icon = L.icon({
    iconUrl:
      "https://c0.klipartz.com/pngpicture/962/833/gratis-png-logotipo-de-ubicacion-roja-fabricante-de-mapas-de-google-mapas-de-google-pin-thumbnail.png",
    iconSize: [25, 41], // size of the icon
    shadowUrl: null,
  });

  useEffect(() => {
    if (el.current) {
      const typed = new Typed(el.current, {
        strings: ["ANK.data", "", "Smart Bin"],
        typeSpeed: 100,
        backSpeed: 100,
        loop: true,
      });

      // Cleanup
      return () => {
        typed.destroy();
      };
    }
  }, []);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("wastedata")
        .select("*")
        .eq("status", "Bin Filled"); // Only fetch rows where status is not null

      if (error) {
        console.error("Error: ", error);
      } else {
        setData(data);
        // Set markers for each data point where status is filled
        const newMarkers = data
          .filter((item) => item.status)
          .map((item) => [item.latitude, item.longitude]);
        setMarkers(newMarkers);
        // Set initial position to the first data point where status is filled
        const firstFilledDataPoint = data.find((item) => item.status);
        if (firstFilledDataPoint) {
          setPosition([
            firstFilledDataPoint.latitude,
            firstFilledDataPoint.longitude,
          ]);
        }
      }
    };

    const fetchData2 = async () => {
      const { data, error } = await supabase.from("trafficdata").select("*");

      if (error) {
        console.error("Error: ", error);
      } else {
        setData2(data);
        // Set markers for each data point
        const newMarkers = data.map((item) => [item.latitude, item.longitude]);
        setMarkers2(newMarkers);
        // Set initial position to the first data point
        if (data[0]) {
          setPosition2([data[0].latitude, data[0].longitude]);
        }
      }
    };

    const fetchData3 = async () => {
      let { data: rankingData, error } = await supabase
        .from("ranking")
        .select("*");

      if (error) console.log("Data fetching error: ", error);
      else setRankingData(rankingData);
    };

    fetchData();
    fetchData2();
    fetchData3();
  }, []);
  // If position is not set yet, don't render the map
  if (!position) {
    return null;
  }

  // If position2 is not set yet, don't render the map
  if (!position2) {
    return null;
  }

  return (
    <>
      <div class="root">
        <header>
          <nav class="navbar">
            {/* <!-- <a href="#" class="nav-logo">WebDev.</a> --> */}
            <ul class="nav-menu">
              <li class="nav-item">
                <a href="#about" class="nav-link">
                  <span>01.</span>About
                </a>
              </li>
              <li class="nav-item">
                <a href="#skills" class="nav-link">
                  <span>02.</span>Our Team
                </a>
              </li>
              <li class="nav-item">
                <a href="#projects" class="nav-link">
                  <span>03.</span>Functionality
                </a>
              </li>
              <li class="nav-item">
                <a href="#contact" class="nav-link">
                  <span>04.</span>Contact
                </a>
              </li>
            </ul>
            <div class="hamburger">
              <span class="bar"></span>
              <span class="bar"></span>
              <span class="bar"></span>
            </div>
          </nav>
        </header>
        <aside id="media-links">
          <ul>
            <li>
              <a href="https://github.com/RES-200" target="_blank">
                <i class="fa-regular fas fab fa-github"></i>
              </a>
            </li>
          </ul>
        </aside>
        <aside class="gmail-link">
          <div class="vertical-text">
            <a href="mailto:4dumbdevs@gmail.com" target="_blank">
              4dumbdevs@gmail.com
            </a>
          </div>
        </aside>
        <div class="wrapper">
          <main>
            <section id="home">
              <div class="home-content">
                <span>Hi, We are Team</span>
                <div class="name-heading">
                  <h1 class="h1_name">RES-200</h1>
                  <h1 class="h1_I_am">
                    Presenting <span ref={el}>ANK.data</span>
                  </h1>
                </div>
                <p class="home-description">
                  Stay tuned to witness our collaborative journey unfold as we
                  strive to make a meaningful impact in the world of technology.
                  Let's hack away and make magic happen!{" "}
                </p>
                <a href="https://github.com/RES-200" target="_blank">
                  <button onclick="opneGithubProfile()" class="special-btn">
                    Check out our Github!
                  </button>
                </a>
              </div>
            </section>
            <section id="about">
              <h1 class="section-heading">
                <span class="heading-number">01.</span>About
              </h1>
              <div class="about-content">
                <div class="personal-content">
                  <p class="description">
                    Hello! we are team RES-200 presenting ANK.data(अंकदाता)
                    introduces two groundbreaking prototypes for community
                    enhancement. The first is an efficient accident detection
                    model that quickly identifies incidents and alerts emergency
                    services. Additionally, it notifies nearby police stations
                    and hospitals through notifications for immediate response
                    and support. The second prototype comprises smart bins that
                    detect when clearance is needed and automatically notify
                    authorities, improving waste management. Combined with our
                    smart city ranking system, which evaluates AQI and quality
                    of life, these prototypes promise substantial advancements
                    in urban living standards.
                  </p>
                  <p class="description"></p>
                </div>
                <div class="my-interests">
                  <div class="my-interests-container">
                    <h2 class="subheading">Our Stacks</h2>
                    <div class="interests-grid-container">
                      <div class="item">
                        <i class="fa-regular fas fas fa-robot"></i>
                        <h4>Robotics</h4>
                      </div>
                      <div class="item">
                        <i class="fa-regular fab fa-python"></i>
                        <h4>Python</h4>
                      </div>
                      <div class="item">
                        <i class="fa-regular fab fa-python"></i>
                        <h4>Opencv</h4>
                      </div>
                      <div class="item">
                        <i class="fa-regular fab fa-python"></i>
                        <h4>YOLO</h4>
                      </div>
                      <div class="item">
                        <i class="fa-brands fa-react"></i>
                        <h4>React</h4>
                      </div>
                      <div class="item">
                        <i class="fa-regular fab fa-js"></i>
                        <h4>javascript</h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section id="skills">
              <h1 class="section-heading">
                <span class="heading-number">02.</span>Our Team
              </h1>
              <p class="description">
                Hola Amigo! <br />
                We're thrilled to introduce you to our website
                "ankdata.vercel.app" made by dynamic team of four talented
                individuals who are ready to take on challenges with passion,
                creativity, and expertise. Each member brings a unique set of
                skills and experiences to the table, making us a formidable
                force. Together, we're committed to pushing the boundaries of
                innovation and developing cutting-edge solutions to the
                challenges presented to us. Stay tuned to witness our
                collaborative journey unfold as we strive to make a meaningful
                impact in the world of technology. Let's hack away and make
                magic happen!
              </p>
              <div class="skills-container">
                <div class="item">
                  <div class="icons">
                    {/* <i class="fa-regular fas fa-robot"></i> */}
                    <i class="fa-regular fas fa-code"></i>
                  </div>
                  <h2>Sinchan Shetty</h2>
                  <p>
                    Hello! I'm an Computer Science undergrad at VIT Chennai with
                    a strong passion for Web Development. I am an active member
                    of IEEE CompSoc.
                  </p>
                </div>
                <div class="item">
                  <div class="icons">
                    <i class="fa-regular fas fa-code"></i>
                  </div>
                  <h2>Harshit Kumar Singh</h2>
                  <p>
                    Ola! I'm an inquisitive Electronics and Computer undergrad
                    at VIT Chennai. Currently holding the position of Joint Gen
                    Sec at IEEE CompSoc. In future I would like to see myself
                    making a difference in the world.
                  </p>
                </div>
                <div class="item">
                  <div class="icons">
                    <i class="fa-regular fas fa-robot"></i>
                  </div>
                  <h2>Utkarsh Rounak</h2>
                  <p>
                    Greetings! I'm a sophomore at VIT Chennai, aspiring to
                    become a Full Stack Developer. Alongside my academic
                    journey, I serve as a Management Team Member at IEEE CS
                    VITC.
                  </p>
                </div>
                <div class="item">
                  <div class="icons">
                    <i class="fa-regular fas fa-robot"></i>
                    <i class="fa-regular fas fa-code"></i>
                  </div>
                  <h2>Shashwat Mishra</h2>
                  <p>
                    Hey there, I'm Shashwat Mishra! I'm deeply passionate about
                    software development and robotics. Always tinkering with
                    code and building robots. Member of IEEECompSoc Technical
                    Team
                  </p>
                </div>
              </div>
            </section>
            <section id="projects">
              <h1 class="section-heading">
                <span class="heading-number">03.</span>Waste Management
              </h1>
              <div class="projects-container">
                {position && (
                  <Map
                    center={position}
                    zoom={13}
                    style={{
                      height: "70vh",
                      width: "100%",
                      marginBottom: "30px",
                    }}
                  >
                    {/* Add the TileLayer for the map */}
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    {/* Map over the markers array */}
                    {markers.map((position, index) => (
                      <Marker key={index} position={position} icon={icon}>
                        {/* Add the Popup component */}
                        <Popup>
                          Latitude: {position[0]}, Longitude: {position[1]},
                          status: Filled
                        </Popup>
                      </Marker>
                    ))}
                  </Map>
                )}
                <h1 class="section-heading">
                  <span class="heading-number">04.</span>Traffic Management
                </h1>
                {position2 && (
                  <Map
                    center={position2}
                    zoom={13}
                    style={{
                      height: "70vh",
                      width: "100%",
                      marginTop: "30px",
                      marginBottom: "30px",
                    }}
                  >
                    {/* Add the TileLayer for the map */}
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    {/* Map over the markers2 array */}
                    {markers2.map((position, index) => (
                      <Marker key={index} position={position} icon={icon}>
                        {/* Add the Popup component */}
                        <Popup>
                          Latitude: {position[0]}, Longitude: {position[1]},
                          status: accident
                        </Popup>
                      </Marker>
                    ))}
                  </Map>
                )}
                <h1 class="section-heading">
                  <span class="heading-number">05.</span>Smart City Ranking
                </h1>
              </div>
              <Table
                striped
                bordered
                hover
                style={{ width: "100%", marginTop: "20px" }}
              >
                <thead style={{ backgroundColor: "#f8f9fa", color: "#495057" }}>
                  <tr>
                    <th>#</th>
                    <th>Cities</th>
                    <th>AQI</th>
                    <th>Transportation</th>
                    <th>Waste</th>
                    <th>Quality of Life</th>
                    {/* Add more columns as needed */}
                  </tr>
                </thead>
                <tbody>
                  {rankingData.map((item, index) => (
                    <tr
                      key={index}
                      style={{
                        backgroundColor: index % 2 === 0 ? "#b2b4c2" : "grey",
                      }}
                    >
                      <td>{index + 1}</td>
                      <td>{item.cities}</td>
                      <td>{item.aqi}</td>
                      <td>{item.transportation}</td>
                      <td>{item.waste}</td>
                      <td>{item.qualityoflife}</td>
                      {/* Add more cells as needed */}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </section>
            <section id="about">
              <h1 class="section-heading">
                <span class="heading-number">06.</span>References
              </h1>
              <div class="about-content">
                <div class="personal-content">
                  <p class="description">
                    <span class="heading-number">01.</span> Consulted with CEO,
                    Bhopal Smart Cities IAS Aditya Singh about the parameters to
                    be taken in consideration.
                  </p>
                  <p class="description">
                    <span class="heading-number">02.</span> Its the first of its
                    kind in publishing ranking of smart cities in India apart
                    from the Ministry of Housing and Urban Affairs.
                  </p>
                  <p class="description">
                    <span class="heading-number">03.</span> Empowering Smart
                    cities/Built for Bharat
                  </p>
                </div>
                <Image
                  src={lion} // Provide the path to your image file
                  alt="description" // Provide a description for your image
                  width={500} // Specify a width
                  height={300} // Specify a height
                />
              </div>
            </section>
            <section id="contact">
              <div class="contact-container">
                <h1 id="contact-heading">
                  <span>07.</span>Contact
                </h1>
                <h2>Get in touch</h2>
                <p>
                  Your feedback is crucial! Please take a moment to share your
                  thoughts on our project. Your insights will help us improve
                  and tailor the experience. Thank you for your time!
                </p>
              </div>
              <a href="mailto:4dumbdevs@gmail.com" target="_blank">
                <button class="special-btn" onclick="mailTo()">
                  Contact me!
                </button>
              </a>
            </section>
          </main>
          <footer id="footer">
            <p id="devName">
              Built by Shashwat Mishra, Harshit Singh, Sinchan Shetty and
              Utkarsh Rounak
            </p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default page;
