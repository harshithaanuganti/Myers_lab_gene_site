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
                  this.createHistogram(effectSizes, 'all-genes-histogram', this.searchedGeneData.Temp37_effect_size, this.searchedGeneData.gene_id);
                })
                .catch(error => console.error('Error fetching all gene data:', error));
            } else {
              this.searchedGeneData = null;
              console.log('Gene not found');
            }
          })
          .catch(error => console.error('Error fetching gene data:', error));
      },
  
      createHistogram(data, canvasId, searchedGeneValue, searchInput) {
  const canvas = document.getElementById(canvasId);

  if (!canvas) {
    console.error(`Canvas element with ID '${canvasId}' not found.`);
    return;
  }

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  try {
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map((_, index) => index + 1),
        datasets: [{
          data: data,
          backgroundColor: data.map(value => (value === searchedGeneValue ? 'rgba(75, 192, 192, 0.2)' : 'rgba(75, 192, 192, 0.2)')),
          borderColor: data.map(value => (value === searchedGeneValue ? 'rgba(255, 0, 0, 1)' : 'rgba(75, 192, 192, 1)')),
          borderWidth: 1,
        }],
      },
      options: {
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });

    // Add a more visible dashed line at the position of the searched gene's value
    const searchedGeneIndex = data.indexOf(searchedGeneValue);
    if (searchedGeneIndex !== -1) {
      const xScale = chart.scales.x;
      const yScale = chart.scales.y;

      ctx.beginPath();
      ctx.setLineDash([5, 5]); // Set the line to be dashed
      ctx.strokeStyle = 'rgba(255, 0, 0, 1)'; // Red color for the line
      ctx.lineWidth = 2;
      ctx.moveTo(xScale.getPixelForValue(searchedGeneIndex + 1), yScale.top);
      ctx.lineTo(xScale.getPixelForValue(searchedGeneIndex + 1), yScale.bottom);
      ctx.stroke();

      // Display searched input text beside the highlighted line
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
  