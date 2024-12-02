import { token } from "../script.js";

if (token) {
  document.getElementById('regAv').style.display = 'none';
} else {
  document.getElementById('logOut').style.display = 'none';
}

document.getElementById('logOut').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.reload();
})