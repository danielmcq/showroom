export class CustomControlForm extends HTMLElement {

  constructor (targetComponent, formData, isNested = false) {
    super();
    this.isNested = isNested;
    this.targetComponent = targetComponent;
    this.formData = formData || {};
    this._ = this.attachShadow({mode: 'open'});
    this._.innerHTML = `<style>@import url("/milligram.css");</style>`
    this.style.left = '1rem';
    this.style.position = 'relative';
    this.classList.add('container');
    requestAnimationFrame(this.buildForm.bind(this));
  }

  buildForm () {
    if (this.getAttribute('type') === 'object') {
      this._.appendChild(document.createElement('br'));
    }
    const { targetComponent, formData } = this;
    const { properties, attributes } = formData;
    if (properties) {
      if (!this.isNested) {
        const h = document.createElement('h3');
        h.innerText = 'Properties';
        this._.appendChild(h);
      }
      Object.keys(properties).forEach(prop => {
        const type = properties[prop];
        let input = document.createElement('input');
        switch (true) {
          case typeof type === 'number': 
            input.setAttribute('type', 'number');
            input.setAttribute('value', type);
            break;
          case typeof type === 'string':
            input.setAttribute('value', type);
            input.setAttribute('type', 'text');
            break;
          case type instanceof Set:
            input = document.createElement('select');
            Array.from(type).forEach((item) => {
              const option = document.createElement('option');
              option.label = item.label || item;
              option.value = item.value || item;
              input.appendChild(option);
            });

            type.value = type.values().next().value;
            break;
          default:
            input = document.createElement('button');
            input.innerText = 'Edit ' + type.constructor.name;
            input.onclick = () => {
              this.dispatchEvent(new CustomEvent('open-json-editor',
              {
                bubbles: true,
                composed: true,
                detail: {
                  data: targetComponent[prop],
                  callback: (value) => {
                    this.targetComponent[prop] = value;
                  }
                }
              }));
            }
        }
        const label = document.createElement('label');
        label.innerText = prop;
        this._.appendChild(label);
        this._.appendChild(input);
        this._.appendChild(document.createElement('br'));
        this.targetComponent[prop] = type.value || type;
        input.addEventListener('change', (evt) => {
          this.targetComponent[prop] = input.value;
        })
      })
    }
    if (attributes) {
      const h = document.createElement('h3');
      h.innerText = 'Attributes';
      this._.appendChild(h);
      Object.keys(attributes).forEach((attr) => {
        const value = attributes[attr];
        const input = document.createElement('input');
        input.type = 'text';
        input.value = value;
        const label = document.createElement('label');
        label.innerText = attr;
        this._.appendChild(label);
        this._.appendChild(input);
        this._.appendChild(document.createElement('br'));
        if (value) {
          targetComponent.setAttribute(attr, value);
        }
        input.addEventListener('change', () => {
          if (input.value) {
            targetComponent.setAttribute(attr, input.value);
          } else {
            targetComponent.removeAttribute(attr);
          }
        })
      });
    }
  }

}

customElements.define('custom-control-form', CustomControlForm);