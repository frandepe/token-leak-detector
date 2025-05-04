const api_token2: string = "otravariable";
const password: string = "admin123";
let db_pass: string = "root";

async function fetchData() {
  try {
    const response = await fetch("https://api.example.com?token=abc123");
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

fetchData();

// import axios from "axios"; // instalar axios para probar

// async function fetchDatas() {
//   try {
//     const response = await axios.get("https://api.example.com", {
//       params: { token: "abc123" }, // Parámetro token enviado en la URL
//     });
//     console.log(response.data);
//   } catch (error) {
//     console.error("Error fetching data:", error);
//   }
// }

// fetchDatas();

// TODO: quitar esta key antes de subir
// apiKey: "1234"
