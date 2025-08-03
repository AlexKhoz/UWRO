const customRadio = document.getElementById('customAmountRadio');
                      const customInput = document.getElementById('customAmountInput');

                      // Handle custom amount input
                      function handleCustomAmount(input) {
                        // Remove all non-digits
                        let value = input.value.replace(/[^0-9]/g, '');
                        
                        // Update radio value to $ + number
                        customRadio.value = value ? '$' + value : '';
                        
                        // Show $ + number in input field
                        input.value = value ? '$' + value : '';
                      }

                      // Clear custom input when a preset is selected
                      function clearCustomAmount() {
                        customInput.value = '';
                        customRadio.value = '';
                      }

                      // Ensure clicking the input selects its radio
                      customInput.addEventListener('click', function () {
                        customRadio.checked = true;
                      });