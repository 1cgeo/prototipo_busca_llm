import L from 'leaflet';

interface SelectionControlOptions extends L.ControlOptions {
  onSelectionStart: () => void;
  onSelectionCancel: () => void;
  isDarkMode: boolean;
}

interface DOMEventHandlerFn {
  (evt: Event): void;
}

export class SelectionControl extends L.Control {
  private _options: SelectionControlOptions;
  private _container: HTMLDivElement | null = null;
  private _button: HTMLAnchorElement | null = null;
  private _isActive: boolean = false;

  constructor(options: SelectionControlOptions) {
    super(options);
    this._options = {
      position: 'topright',
      ...options
    };
  }

  onAdd(_map: L.Map): HTMLElement {
    this._container = L.DomUtil.create(
      'div',
      'leaflet-control leaflet-bar selection-control'
    ) as HTMLDivElement;

    this._button = L.DomUtil.create(
      'a',
      '',
      this._container
    ) as HTMLAnchorElement;
    
    this._button.href = '#';
    this._button.title = 'Selecionar área no mapa';
    this._button.setAttribute('role', 'button');
    this._button.setAttribute('aria-label', 'Selecionar área no mapa');
    
    this._button.innerHTML = `
      <svg 
        viewBox="0 0 24 24" 
        width="18" 
        height="18" 
        stroke="currentColor" 
        fill="none" 
        stroke-width="2"
        style="display: block;"
      >
        <path d="M21 3H3v18h18V3z"/>
      </svg>
    `;

    Object.assign(this._button.style, {
      width: '30px',
      height: '30px',
      lineHeight: '30px',
      textAlign: 'center',
      backgroundColor: this._options.isDarkMode ? '#1e1e1e' : '#ffffff',
      color: this._options.isDarkMode ? '#ffffff' : '#000000',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    });

    L.DomEvent.disableClickPropagation(this._container);
    L.DomEvent.disableScrollPropagation(this._container);

    this._button.addEventListener('click', this._handleClick);
    this._button.addEventListener('keydown', this._handleKeyDown);

    return this._container;
  }

  onRemove(_map: L.Map): void {
    if (this._button) {
      this._button.removeEventListener('click', this._handleClick);
      this._button.removeEventListener('keydown', this._handleKeyDown);
    }
    this._container = null;
    this._button = null;
  }

  private _handleClick: DOMEventHandlerFn = (e: Event) => {
    e.preventDefault();
    this._toggleSelection();
  };

  private _handleKeyDown: DOMEventHandlerFn = (e: Event) => {
    const keyEvent = e as KeyboardEvent;
    if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
      e.preventDefault();
      this._toggleSelection();
    }
  };

  private _toggleSelection(): void {
    this._isActive = !this._isActive;
    this._updateButtonState();

    if (this._isActive) {
      this._options.onSelectionStart();
    } else {
      this._options.onSelectionCancel();
    }
  }

  setActive(active: boolean): void {
    if (this._isActive !== active) {
      this._isActive = active;
      this._updateButtonState();
    }
  }

  private _updateButtonState(): void {
    if (!this._button) return;

    if (this._isActive) {
      this._button.classList.add('active');
      this._button.style.backgroundColor = this._options.isDarkMode 
        ? '#333333' 
        : '#f0f0f0';
      this._button.title = 'Cancelar seleção';
    } else {
      this._button.classList.remove('active');
      this._button.style.backgroundColor = this._options.isDarkMode 
        ? '#1e1e1e' 
        : '#ffffff';
      this._button.title = 'Selecionar área no mapa';
    }
  }

  updateTheme(isDarkMode: boolean): void {
    if (this._button) {
      this._options.isDarkMode = isDarkMode;
      this._updateButtonState();
    }
  }

  getState(): boolean {
    return this._isActive;
  }
}