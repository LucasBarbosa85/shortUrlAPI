<template>
  <div class="manage" style="background-color: #f5f5f5; min-height: 100vh; display: flex; justify-content: center; align-items: center;">
    <div class="shorten-form card p-4" style="width: 90%; background-color: #ffffff; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); margin: 50px; max-width: 500px">
      <h2 class="card-title" style="color: #3498db;">Encurtar URL</h2>
      <form @submit.prevent="shortenURL">
        <div class="form-group">
          <label for="originalURL" style="color: #333;">URL original</label>
          <input v-model="originalURL" type="text" class="form-control" id="originalURL" placeholder="Digite a URL original" />
        </div>
        <div class="form-group">
          <label for="customPath" style="color: #333;">Nome personalizado (opcional)</label>
           <input v-model="customPath" type="text" class="form-control" id="customPath" placeholder="Digite o nome personalizado (opcional)" />
        </div>
        <div class="form-group">
          <label for="expirationDate" style="color: #333;">Data de Expiração</label>
          <input v-model="expirationDate" type="date" class="form-control" id="expirationDate" style="color: #595c5f" />
        </div>
        <div class="form-group">
          <label for="maxVisits" style="color: #333;">Número Máximo de Visitas</label>
          <input v-model="maxVisits" type="number" class="form-control" id="maxVisits" placeholder="Número Máximo de Visitas" style="color: #595c5f" />
        </div>
        <button type="submit" class="btn btn-primary">Encurtar</button>
      </form>
      <p class="error mt-2" style="color: #d9534f;">{{ errorMessage }}</p>
    </div>
    
    <div class="short-url-list card p-4 scrollbar" style="width: 80%; background-color: #ffffff; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); margin: 20px;">
      <h2 class="card-title" style="color: #3498db;">URLs Curtas</h2>
  <ul class="list-group">
  <li v-for="url in shortURLs" :key="url.id" class="list-group-item">
    <div class="d-flex justify-content-between align-items-center">
      <a @click="redirectToOriginalURL(url.shortURL)" class="links">localhost:3000/{{ url.customPath || url.shortURL }}</a>
      <span v-if="url.id === invalidatedLinkId">Link Invalidado</span>
      <span v-else>Visitas: {{ url.visitCount }} / {{ url.maxVisitsCount || 'ilimitado' }}  ({{ formatExpirationDate(url.expirationDate)}}) - {{ urlInvalida(url.isInvalid) }}</span>
      <button @click="invalidateLink(url.id)" class="btn btn-danger">Invalidar</button>
    </div>
  </li>
</ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import moment from 'moment';

const API_URL = 'http://localhost:3000';

export default {
  data() {
    return {
      originalURL: "",
      customPath: "",
      expirationDate: "",
      maxVisits: 0,
      errorMessage: "",
      shortURLs: [],
      invalidatedLinkId: null
    };
  },
  created() {
    this.fetchShortURLs();
  },
  methods: {
    async shortenURL() {
      const token = localStorage.getItem('token');

      if (!token) {
        this.errorMessage = 'Token não fornecido';
        return;
      }

      const data = {
        originalURL: this.originalURL,
        customPath: this.customPath,
        expirationDate: this.expirationDate,
        maxVisits: this.maxVisits,
      };

      axios
        .post(`${API_URL}/api/shorten`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          if (response.data.success) {
            this.originalURL = "";
            this.customPath = "";
            this.expirationDate = "";
            this.maxVisits = 0;
            this.errorMessage = "";
            this.fetchShortURLs();
          } else {
            this.errorMessage = 'Erro ao encurtar a URL.';
          }
        })
        .catch((error) => {
          this.errorMessage = 'Erro ao encurtar a URL';
          console.error(error);
        });
    },
    async fetchShortURLs() {
      const token = localStorage.getItem('token');

      if (!token) {
        return;
      }

      axios
        .get(`${API_URL}/api/shorturls`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          if (response.data.success) {
            this.shortURLs = response.data.urls;
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    redirectToOriginalURL(shortURL) {
      const fullURL = `${API_URL}/${shortURL}`;
      
       window.open(fullURL, '_blank');
    },
    invalidateLink(linkId) {
      const token = localStorage.getItem('token');

      axios
        .post(`${API_URL}/api/invalidate/${linkId}`, null, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          if (response.data.success) {
            this.fetchShortURLs();
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    formatExpirationDate(date) {
    if (moment(date).isValid()) {
      return moment(date).format('DD/MM/YYYY');
    } else {
      return 'Sem data';
    }
  },
  urlInvalida(isInvalid) {
    if(isInvalid) {
      return 'Invalida';
    } else {
      return 'Valida';
    }
  }
  },
};
</script>

<style scoped>
.manage {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #3498db;
}

.shorten-form {
  background: #fff;
  border-radius: 5px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  height: 450px;
}

.short-url-list {
  background: #fff;
  border-radius: 5px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  height: 450px;
}

h2 {
  margin: 0;
}

form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}



ul {
  list-style-type: none;
  padding: 0;
}

.links {
  cursor: pointer;
  text-decoration: none;
  color: black;
}
.links:hover {
  color: blue;
}
.error {
  color: red;
}
.scrollbar {
  max-height: 450px;
  overflow-y: auto;
}
</style>