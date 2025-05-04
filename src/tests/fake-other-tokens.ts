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
