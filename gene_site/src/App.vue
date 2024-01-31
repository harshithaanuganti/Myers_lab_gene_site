<template>
    <div id="app">
      <div id="search-container">
        <h2>Gene Search Results</h2>
        <label for="gene-search">Search Gene:</label>
        <input v-model="searchInput" type="text" id="gene-search" placeholder="Enter gene name">
        <button @click="searchGene">Search</button>
      </div>
  
      <div id="results-container">
        <div v-if="searchedGeneData">
          <p>The Effect size is {{ searchedGeneData.gene_id }}: {{ searchedGeneData.Temp37_effect_size }}</p>
          <canvas id="all-genes-histogram" width="400" height="200"></canvas>
        </div>
        <div v-else>
          <p>No results found for the searched gene.</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import Chart from 'chart.js/auto';
  
  export default {
    data() {
      return {
        searchInput: '',
        searchedGeneData: null,
        chartInstance: null,
      };
    },
    methods: {
      searchGene() {
        fetch(`http://localhost:8000/api/get_effect_size/${this.searchInput}`)
          .then(response => response.json())
          .then(data => {
            if (data.message === 'success') {
              this.searchedGeneData = data.data;
              fetch('http://localhost:8000/api/all_gene_data')
                .then(response => response.json())
                .then(allData => {
                  const effectSizes = allData.data.map(gene => gene.Temp37_effect_size);
                  //const roundedSearchedGeneValue = Math.round(this.searchedGeneData.Temp37_effect_size * 100) / 100;
                  const roundedSearchedGeneValue = parseFloat(this.searchedGeneData.Temp37_effect_size).toFixed(2);
                  this.createHistogram(
                    effectSizes,
                    'all-genes-histogram',
                    roundedSearchedGeneValue,
                    this.searchedGeneData.gene_id,
                    this.searchInput
                  );
                })
                .catch(error => console.error('Error fetching all gene data:', error));
            } else {
              this.searchedGeneData = null;
              console.log('Gene not found');
            }
          })
          .catch(error => console.error('Error fetching gene data:', error));
      },
  
      createHistogram(data, canvasId, searchedGeneValue, geneId, searchInput) {
        const canvas = document.getElementById(canvasId);
  
        if (!canvas) {
          console.error(`Canvas element with ID '${canvasId}' not found.`);
          return;
        }
  
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
  
        try {
          data = data.map(value => parseFloat(value).toFixed(2));
  
          const counts = {};
          data.forEach(value => {
            counts[value] = (counts[value] || 0) + 1;
          });
  
          const uniqueValues = Object.keys(counts);
          const frequencies = Object.values(counts);
  
          const chart = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: uniqueValues,
              datasets: [
                {
                  data: frequencies,
                  backgroundColor: 'rgba(75, 192, 192, 0.7)',
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 1,
                },
              ],
            },
            options: {
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Effect Sizes',
                    color: 'rgba(0, 0, 0, 0.8)',
                  },
                  grid: {
                    display: false,
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: 'Frequency',
                    color: 'rgba(0, 0, 0, 0.8)',
                  },
                  grid: {
                    display: true,
                  },
                },
              },
              plugins: {
                legend: {
                  display: false,
                },
              },
            },
          });
  
          const searchedGeneIndex = uniqueValues.indexOf(searchedGeneValue);
          console.log(searchedGeneValue);
          console.log(searchedGeneIndex);
          console.log(uniqueValues.indexOf(searchedGeneValue));
          if (searchedGeneIndex !== -1) {
            const xScale = chart.scales.x;
            const yScale = chart.scales.y;
            console.log(xScale.getPixelForValue(searchedGeneIndex), yScale.top, yScale.bottom);
  
            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = 'rgba(255, 0, 0, 1)'; // Red color for the line
            ctx.lineWidth = 10;
            console.log(yScale.top, yScale.bottom);
            ctx.moveTo(xScale.getPixelForValue(searchedGeneIndex + 1), yScale.top);
            ctx.lineTo(xScale.getPixelForValue(searchedGeneIndex + 1), yScale.bottom);
            ctx.stroke();
            console.log('rendering the path');
            ctx.closePath();
            console.log('rendered the path')
  
            ctx.fillStyle = 'black';
            ctx.font = '14px Arial';
            ctx.fillText(searchInput, xScale.getPixelForValue(searchedGeneIndex + 1) + 10, yScale.bottom - 10);
          }
        } catch (error) {
          console.error('Error creating histogram:', error);
        }
      },
    },
  };
  </script>
  
  <style scoped>
  /* Add your component-specific styles here */
  </style>
  