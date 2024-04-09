document.addEventListener('DOMContentLoaded', function() {
  const productId = window.location.pathname.split('/').pop();
  const availabilityElement = document.getElementById('availability');
  const purchaseButton = document.getElementById('purchaseButton');

  function checkAvailability() {
    fetch(`/products/availability/${productId}`)
      .then(response => response.json())
      .then(data => {
        if (!data.availability) {
          availabilityElement.textContent = 'Sold Out';
          if (purchaseButton) {
            purchaseButton.disabled = true;
          }
        }
      })
      .catch(error => {
        console.error('Error checking product availability:', error.message);
        console.error(error.stack);
      });
  }

  if (purchaseButton) {
    purchaseButton.addEventListener('click', function() {
      // This is where the integration with the payment system would go.
      console.log('Initiating purchase for product:', productId);
      // Here you would redirect to the payment gateway or update the UI to indicate the purchase process has started.
    });
  }

  // Check availability on page load
  checkAvailability();

  // Optionally, set an interval to check availability periodically
  setInterval(checkAvailability, 60000); // 60 seconds
});