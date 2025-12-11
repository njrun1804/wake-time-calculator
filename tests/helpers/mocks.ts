/**
 * Reusable mocking utilities for tests
 */

// ============================================================================
// LOCALSTORAGE MOCK
// ============================================================================

export class MockLocalStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get length(): number {
    return this.store.size;
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] ?? null;
  }
}

/**
 * Setup localStorage mock in global scope
 */
export function setupLocalStorageMock(): MockLocalStorage {
  const mockStorage = new MockLocalStorage();
  (global as unknown as { localStorage: MockLocalStorage }).localStorage = mockStorage;
  return mockStorage;
}

// ============================================================================
// FETCH MOCK
// ============================================================================

export interface MockFetchOptions {
  response?: Response | null;
  error?: Error | null;
  handler?: (url: string | URL | Request, init?: RequestInit) => Promise<Response>;
}

let mockFetchState: MockFetchOptions = {};

const originalFetch = global.fetch;

/**
 * Setup fetch mock
 */
export function setupFetchMock(options: MockFetchOptions = {}): void {
  mockFetchState = { ...options };

  global.fetch = async (url: string | URL | Request, init?: RequestInit): Promise<Response> => {
    if (mockFetchState.error) {
      return Promise.reject(mockFetchState.error);
    }
    if (mockFetchState.handler) {
      return mockFetchState.handler(url, init);
    }
    if (mockFetchState.response) {
      return Promise.resolve(mockFetchState.response);
    }
    return originalFetch(url, init);
  };
}

/**
 * Reset fetch mock to original
 */
export function resetFetchMock(): void {
  global.fetch = originalFetch;
  mockFetchState = {};
}

/**
 * Create a mock Response with JSON body
 */
export function createMockJsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Create a mock Response with text body
 */
export function createMockTextResponse(text: string, status = 200): Response {
  return new Response(text, {
    status,
    headers: { "Content-Type": "text/plain" },
  });
}

// ============================================================================
// GEOLOCATION MOCK
// ============================================================================

export interface MockGeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamp: number;
}

export interface MockGeolocationError {
  code: number;
  message: string;
  PERMISSION_DENIED: number;
  POSITION_UNAVAILABLE: number;
  TIMEOUT: number;
}

export class MockGeolocation {
  private positionCallback: ((position: MockGeolocationPosition) => void) | null = null;
  private errorCallback: ((error: MockGeolocationError) => void) | null = null;
  private simulateSuccess = true;
  private simulateError: MockGeolocationError | null = null;
  private defaultPosition: MockGeolocationPosition = {
    coords: {
      latitude: 40.7128,
      longitude: -74.006,
      accuracy: 10,
    },
    timestamp: Date.now(),
  };

  getCurrentPosition(
    success: (position: MockGeolocationPosition) => void,
    error: (error: MockGeolocationError) => void,
    options?: PositionOptions
  ): void {
    this.positionCallback = success;
    this.errorCallback = error;

    // Simulate async behavior
    setTimeout(() => {
      if (this.simulateSuccess && !this.simulateError) {
        this.positionCallback?.(this.defaultPosition);
      } else if (this.simulateError) {
        this.errorCallback?.(this.simulateError);
      }
    }, 0);
  }

  setSimulateSuccess(success: boolean): void {
    this.simulateSuccess = success;
  }

  setSimulateError(error: MockGeolocationError | null): void {
    this.simulateError = error;
  }

  setDefaultPosition(position: MockGeolocationPosition): void {
    this.defaultPosition = position;
  }
}

/**
 * Setup geolocation mock in global scope
 */
export function setupGeolocationMock(): MockGeolocation {
  const mockGeolocation = new MockGeolocation();
  (global as unknown as { navigator: { geolocation: MockGeolocation } }).navigator = {
    geolocation: mockGeolocation,
  } as unknown as Navigator;
  return mockGeolocation;
}

/**
 * Remove geolocation from navigator (simulate unsupported)
 */
export function removeGeolocationMock(): void {
  (global as unknown as { navigator: { geolocation?: MockGeolocation } }).navigator = {} as Navigator;
}

// ============================================================================
// DOM MOCK
// ============================================================================

export interface MockHTMLElement {
  id: string;
  textContent: string;
  classList: {
    add: (className: string) => void;
    remove: (className: string) => void;
    contains: (className: string) => boolean;
    toggle: (className: string) => void;
  };
  style: {
    cssText: string;
    display: string;
    opacity: string;
  };
}

export class MockDocument {
  private elements: Map<string, MockHTMLElement> = new Map();

  getElementById(id: string): MockHTMLElement | null {
    return this.elements.get(id) ?? null;
  }

  createElement(tag: string): MockHTMLElement {
    const element: MockHTMLElement = {
      id: "",
      textContent: "",
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false,
        toggle: () => {},
      },
      style: {
        cssText: "",
        display: "",
        opacity: "",
      },
    };
    return element;
  }

  body = {
    appendChild: () => {},
  };

  /**
   * Register an element that will be returned by getElementById
   */
  registerElement(id: string, element?: Partial<MockHTMLElement>): MockHTMLElement {
    const mockElement: MockHTMLElement = {
      id,
      textContent: element?.textContent ?? "",
      classList: {
        add: element?.classList?.add ?? (() => {}),
        remove: element?.classList?.remove ?? (() => {}),
        contains: element?.classList?.contains ?? (() => false),
        toggle: element?.classList?.toggle ?? (() => {}),
      },
      style: {
        cssText: element?.style?.cssText ?? "",
        display: element?.style?.display ?? "",
        opacity: element?.style?.opacity ?? "",
      },
    };
    this.elements.set(id, mockElement);
    return mockElement;
  }

  /**
   * Clear all registered elements
   */
  clear(): void {
    this.elements.clear();
  }
}

/**
 * Setup document mock in global scope
 */
export function setupDocumentMock(): MockDocument {
  const mockDocument = new MockDocument();
  (global as unknown as { document: MockDocument }).document = mockDocument as unknown as Document;
  return mockDocument;
}

/**
 * Remove document from global (simulate SSR/Node environment)
 */
export function removeDocumentMock(): void {
  (global as unknown as { document: undefined }).document = undefined;
}

// ============================================================================
// WINDOW MOCK
// ============================================================================

export interface MockWindow {
  requestIdleCallback?: typeof window.requestIdleCallback;
  cancelIdleCallback?: typeof window.cancelIdleCallback;
  setTimeout?: typeof window.setTimeout;
  clearTimeout?: typeof window.clearTimeout;
}

/**
 * Setup window mock in global scope
 */
export function setupWindowMock(mockWindow: MockWindow = {}): MockWindow {
  (global as unknown as { window: MockWindow }).window = mockWindow as unknown as Window;
  return mockWindow;
}

/**
 * Remove window from global (simulate Node environment)
 */
export function removeWindowMock(): void {
  (global as unknown as { window: undefined }).window = undefined;
}
