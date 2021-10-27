if (!customElements.get('product-form')) {
  
  function cartListen() {
    fetch('/cart.js')
    .then(response => response.json())
    .then(data => {
      let numero = data.item_count;
      // console.log(data);
      // if(numero === 0) {
      //   console.log('numbers are nuffin: ' + numero)
      // } else {
      //   console.log('we have stuff: ' + numero)
      // }
      
      console.log(data.item_count);
      let freeSamples = 0;
      data.items.forEach( function(prods) {
        // console.log(prods.id);
        if (prods.product_type == 'Free Sample') {
          let qty = prods.quantity;
          freeSamples += qty;
          console.log('free samples: ' +freeSamples);
        }
      });
      
      if(freeSamples > 4 ) {
        console.log("No more freebies for you");
        document.body.classList.add("paid");
        document.body.classList.remove("free");
      } else {
        console.log("Ok, as you were");
        document.body.classList.add("free");
        document.body.classList.remove("paid");
      }
      
    })
  }
  
  cartListen();
  
  customElements.define('product-form', class ProductForm extends HTMLElement {
    constructor() {
      super();

      this.form = this.querySelector('form');
      this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
      this.cartNotification = document.querySelector('cart-notification');
    }

    onSubmitHandler(evt) {
      evt.preventDefault();
      const submitButton = this.querySelector('[type="submit"]');
      if (submitButton.classList.contains('loading')) return; 

      this.handleErrorMessage();
      this.cartNotification.setActiveElement(document.activeElement);

      submitButton.setAttribute('aria-disabled', true);
      submitButton.classList.add('loading');
      this.querySelector('.loading-overlay__spinner').classList.remove('hidden');

      const config = fetchConfig('javascript');
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      config.body = JSON.stringify({
        ...JSON.parse(serializeForm(this.form)),
        sections: this.cartNotification.getSectionsToRender().map((section) => section.id),
        sections_url: window.location.pathname
      });

      fetch(`${routes.cart_add_url}`, config)
        .then((response) => response.json())
        .then((response) => {
          if (response.status) {
            this.handleErrorMessage(response.description);
            return;
          }

          this.cartNotification.renderContents(response);
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          submitButton.classList.remove('loading');
          submitButton.removeAttribute('aria-disabled');
          this.querySelector('.loading-overlay__spinner').classList.add('hidden');
          cartListen();
        });
    }

    handleErrorMessage(errorMessage = false) {
      this.errorMessageWrapper = this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
      this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

      this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

      if (errorMessage) {
        this.errorMessage.textContent = errorMessage;
      }
    }
  });
}
