<template>
  <div>
    <div class="header">
      <div class="header-content">
        <div class="auth-buttons">
          <button>Log in</button>
          <button>Sign in</button>
        </div>
      </div>
    </div>
    <div class="main-content">
      <div class="logo-name">Mark</div>
      <div>
        <input type="text" class="search-panel" placeholder="Search..." />
      </div>
    </div>
  </div>
</template>

<script></script>

<style>
.header {
  width: 100%;
  height: 50px;
  background: #2b2424;
  display: flex;

  position: fixed;
}

.header-content {
  width: 100%;
  max-width: 1200px;
  display: flex;
  /* justify-content: space-between; */
  align-items: center;
  padding: 0 20px;
}

.auth-buttons {
  display: flex;
  gap: 15px;
  position: absolute;
  right: 0;
  padding-right: 15px;
  height: 40px;
}

button {
  font-size: 15px;
  width: 90px;
  background: black;
  border-radius: 15px;
  border: none;
  color: rgb(168, 107, 168);
  opacity: 0.8;
  transition: 0.4s;
  cursor: pointer;
}

button:hover {
  font-size: 17px;
  width: 90px;
  background: rgba(128, 58, 128, 0.568);
  border-radius: 12px;
  color: white;
  opacity: 1;
  transition: 0.4s;
  cursor: pointer;
}

.main-content {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 55vh;
  flex-direction: column;
}

.logo-name {
  font-size: 120px;
  background: linear-gradient(90deg, rgba(9, 70, 121, 1) 19%, rgba(255, 0, 245, 1) 63%);
  -webkit-background-clip: text;
  color: transparent;
  text-fill-color: transparent;
}

.search-panel {
  width: 700px;
  height: 45px;
  border-radius: 15px;
  border: 2px solid gray;
  margin-top: 25px;
  color: white;
  font-size: 20px;
  outline: none;
  background: transparent;
  padding: 0 15px 0px 15px;
}

.search-panel:focus {
  width: 700px;
  height: 45px;
  border-radius: 15px;
  border: 2px solid white;
  margin-top: 25px;
  color: white;
  font-size: 20px;
  outline: none;
  background: transparent;
  padding: 0 15px 0px 15px;
}
</style>
