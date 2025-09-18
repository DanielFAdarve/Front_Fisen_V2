import {
  Injectable,
  TestBed,
  setClassMetadata,
  ɵɵdefineInjectable
} from "./chunk-PDPNR5ZD.js";

// src/app/services/auth-service.spec.ts
import { describe, beforeEach, it, expect } from "vitest";

// src/app/services/auth-service.ts
var AuthService = class _AuthService {
  static \u0275fac = function AuthService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _AuthService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _AuthService, factory: _AuthService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AuthService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();

// src/app/services/auth-service.spec.ts
describe("AuthService", () => {
  let service;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });
  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
//# sourceMappingURL=spec-auth-service.spec.js.map
